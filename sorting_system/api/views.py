from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import ClassificationSerializer, DetectionResponseSerializer
from django.apps import apps
import cv2
import numpy as np
import base64
import logging
from core.models import UploadedImage
from classification.models import ClassificationResult
from detection.models import DetectionResult
from django.core.files.base import ContentFile
import uuid
from django.shortcuts import get_object_or_404
import time
from monitoring.metrics import (
    CLASSIFICATION_REQUESTS,
    DETECTION_REQUESTS,
    CLASSIFICATION_PROCESSING_TIME,
    DETECTION_PROCESSING_TIME,
    CURRENTLY_PROCESSING_CLASSIFICATIONS,
    CURRENTLY_PROCESSING_DETECTIONS,
    MODEL_INFERENCE_COUNT
)

class ClassifyAPIView(APIView):
    def post(self, request):
        # Проверяем наличие изображения в запросе
        if 'image' not in request.FILES:
            CLASSIFICATION_REQUESTS.labels(status='error').inc()
            return Response(
                {"error": "Изображение не предоставлено"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Увеличиваем счетчик обрабатываемых классификаций
        CURRENTLY_PROCESSING_CLASSIFICATIONS.inc()
        start_time = time.time()
        
        try:
            classification_app = apps.get_app_config('classification')
            classifier = classification_app.classifier
            
            # Проверяем, инициализирован ли классификатор
            if not classifier.initialized:
                CLASSIFICATION_REQUESTS.labels(status='error').inc()
                CURRENTLY_PROCESSING_CLASSIFICATIONS.dec()
                return Response(
                    {"error": "Модель классификации не загружена. Обратитесь к администратору."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            # Читаем изображение
            image_file = request.FILES['image']
            image_bytes = np.frombuffer(image_file.read(), np.uint8)
            image = cv2.imdecode(image_bytes, cv2.IMREAD_COLOR)
            
            if image is None:
                CLASSIFICATION_REQUESTS.labels(status='error').inc()
                CURRENTLY_PROCESSING_CLASSIFICATIONS.dec()
                return Response(
                    {"error": "Не удалось прочитать изображение"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Выполняем классификацию
            MODEL_INFERENCE_COUNT.labels(model_type='classification').inc()
            class_name, confidence = classifier.predict(image)

            # Сохраняем изображение в базу данных
            unique_filename = f"{uuid.uuid4()}_{image_file.name}"
            uploaded_image = UploadedImage()
            uploaded_image.image.save(unique_filename, image_file, save=True)
            
            # Сохраняем результат классификации в базу данных
            
            classification_result = ClassificationResult(
                image=uploaded_image,
                material=class_name,
                confidence=confidence
            )
            classification_result.save()

            data = {
                "class_name": class_name,
                "confidence": confidence,
                "image_id": uploaded_image.id,  # Добавляем ID изображения для возможности удаления
                "is_wrong": classification_result.is_wrong  # Добавляем флаг is_wrong
            }
            # Валидируем данные через сериализатор
            serializer = ClassificationSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            
            # Записываем метрики
            processing_time = time.time() - start_time
            CLASSIFICATION_PROCESSING_TIME.observe(processing_time)
            CLASSIFICATION_REQUESTS.labels(status='success').inc()
            CURRENTLY_PROCESSING_CLASSIFICATIONS.dec()
            
            return Response(serializer.data)
            
        except Exception as e:
            # Логируем ошибку для отладки
            logger = logging.getLogger(__name__)
            logger.error(f"Ошибка при классификации изображения: {str(e)}")
            
            # Записываем метрики ошибок
            CLASSIFICATION_REQUESTS.labels(status='error').inc()
            CURRENTLY_PROCESSING_CLASSIFICATIONS.dec()
            
            return Response(
                {"error": "Ошибка при обработке изображения (exception)"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def put(self, request, image_id):
        """Обновление классификации (пометка как неправильная)"""
        try:
            # Получаем результат классификации по image_id
            try:
                uploaded_image = UploadedImage.objects.get(id=image_id)
                classification_result = ClassificationResult.objects.get(image=uploaded_image)
            except UploadedImage.DoesNotExist:
                return Response(
                    {"error": "Изображение не найдено"},
                    status=status.HTTP_404_NOT_FOUND
                )
            except ClassificationResult.DoesNotExist:
                return Response(
                    {"error": "Результат классификации не найден"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Получаем данные из запроса
            is_wrong = request.data.get('is_wrong', None)
            
            if is_wrong is None:
                return Response(
                    {"error": "Поле 'is_wrong' обязательно для обновления"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Обновляем флаг is_wrong
            classification_result.is_wrong = is_wrong
            classification_result.save()
            
            # Подготавливаем данные для ответа
            data = {
                "class_name": classification_result.material,
                "confidence": classification_result.confidence,
                "image_id": classification_result.image.id,
                "is_wrong": classification_result.is_wrong
            }
            
            # Валидируем данные через сериализатор
            serializer = ClassificationSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Логируем ошибку для отладки
            logger = logging.getLogger(__name__)
            logger.error(f"Ошибка при обновлении классификации: {str(e)}")
            
            return Response(
                {"error": "Ошибка при обновлении классификации"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def delete(self, request, image_id):
        """Удаление загруженного изображения и всех связанных результатов"""
        try:
            # Получаем изображение или возвращаем 404
            uploaded_image = get_object_or_404(UploadedImage, id=image_id)
            
            # Удаляем файлы с диска
            if uploaded_image.image:
                uploaded_image.image.delete(save=False)
            if uploaded_image.processed_image:
                uploaded_image.processed_image.delete(save=False)
            
            # Удаляем запись из базы данных (каскадное удаление удалит связанные результаты)
            uploaded_image.delete()
            
            return Response(
                {"message": "Изображение и все связанные результаты успешно удалены"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.error(f"Ошибка при удалении изображения: {str(e)}")
            
            return Response(
                {"error": "Ошибка при удалении изображения"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        


class DetectObjectsView(APIView):    
    def post(self, request):
        # Проверяем наличие изображения в запросе
        if 'image' not in request.FILES:
            DETECTION_REQUESTS.labels(status='error').inc()
            return Response(
                {"error": "Изображение не предоставлено"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Увеличиваем счетчик обрабатываемых детекций
        CURRENTLY_PROCESSING_DETECTIONS.inc()
        start_time = time.time()
        
        try:
            # Читаем изображение
            image_file = request.FILES['image']
            image_bytes = np.frombuffer(image_file.read(), np.uint8)
            image = cv2.imdecode(image_bytes, cv2.IMREAD_COLOR)
            
            if image is None:
                DETECTION_REQUESTS.labels(status='error').inc()
                CURRENTLY_PROCESSING_DETECTIONS.dec()
                return Response(
                    {"error": "Не удалось прочитать изображение"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)  # Конвертируем в RGB
            
            # Получаем детектор из конфигурации приложения
            detection_app = apps.get_app_config('detection')
            detector = detection_app.detector
            
            # Проверяем, инициализирован ли детектор
            # Note: The Detector class doesn't have an 'initialized' attribute like the Classifier.
            # We'll assume it's always initialized if we can get it from the app config.
            
            # Выполняем детекцию
            MODEL_INFERENCE_COUNT.labels(model_type='detection').inc()
            detections = detector.predict(image)
            
            # Сохраняем изображение в базу данных
            unique_filename = f"{uuid.uuid4()}_{image_file.name}"
            uploaded_image = UploadedImage()
            uploaded_image.image.save(unique_filename, image_file, save=True)
            
            # Если объекты не обнаружены
            if not detections:
                response_data = {
                    "detections": [
                        {
                            "class_name": "Нет",
                            "confidence": "0",
                            "box": [0, 0, 0, 0]
                        }
                    ],
                    "processed_image_base64": "0",
                    "image_id": uploaded_image.id
                }
                serializer = DetectionResponseSerializer(data=response_data)
                serializer.is_valid(raise_exception=True)
                
                # Записываем метрики
                processing_time = time.time() - start_time
                DETECTION_PROCESSING_TIME.observe(processing_time)
                DETECTION_REQUESTS.labels(status='success').inc()
                CURRENTLY_PROCESSING_DETECTIONS.dec()
                
                return Response(serializer.data, status=status.HTTP_200_OK)
                # return Response(
                #     {"error": "На изображении не обнаружено объектов"},
                #     status=status.HTTP_400_BAD_REQUEST
                # )
            
            # Рисуем результаты на изображении
            processed_image = detector.draw_detections(image.copy(), detections)
            
            # Сохраняем обработанное изображение в базу данных
            _, buffer = cv2.imencode('.jpg', cv2.cvtColor(processed_image, cv2.COLOR_RGB2BGR))
            processed_image_file = ContentFile(buffer.tobytes())
            processed_filename = f"processed_{unique_filename}"
            uploaded_image.processed_image.save(processed_filename, processed_image_file, save=True)
            
            # Сохраняем результаты детекции в базу данных
            detection_results = []
            for detection in detections:
                detection_result = DetectionResult(
                    image=uploaded_image,
                    x_min=detection['box'][0],
                    y_min=detection['box'][1],
                    x_max=detection['box'][2],
                    y_max=detection['box'][3],
                    confidence=detection['confidence']
                )
                detection_result.save()
                detection_results.append(detection_result)
            
            processed_image_base64 = base64.b64encode(buffer).decode('utf-8')
            
            # Формируем данные для ответа
            response_data = {
                "detections": [
                    {
                        "class_name": detection['class_name'],
                        "confidence": detection['confidence'],
                        "box": detection['box']
                    }
                    for detection in detections
                ],
                "processed_image_base64": f"data:image/jpeg;base64,{processed_image_base64}",
                "image_id": uploaded_image.id  # Добавляем ID изображения для возможности удаления
            }
            
            # Валидируем данные через сериализатор
            serializer = DetectionResponseSerializer(data=response_data)
            serializer.is_valid(raise_exception=True)
            
            # Записываем метрики
            processing_time = time.time() - start_time
            DETECTION_PROCESSING_TIME.observe(processing_time)
            DETECTION_REQUESTS.labels(status='success').inc()
            CURRENTLY_PROCESSING_DETECTIONS.dec()
            
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Ошибка при детекции объектов: {str(e)}")
            
            # Записываем метрики ошибок
            DETECTION_REQUESTS.labels(status='error').inc()
            CURRENTLY_PROCESSING_DETECTIONS.dec()
            
            return Response(
                {"error": "Ошибка при обнаружении объектов"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def delete(self, request, image_id):
        """Удаление загруженного изображения и всех связанных результатов"""
        try:
            # Получаем изображение или возвращаем 404
            uploaded_image = get_object_or_404(UploadedImage, id=image_id)
            
            # Удаляем файлы с диска
            if uploaded_image.image:
                uploaded_image.image.delete(save=False)
            if uploaded_image.processed_image:
                uploaded_image.processed_image.delete(save=False)
            
            # Удаляем запись из базы данных (каскадное удаление удалит связанные результаты)
            uploaded_image.delete()
            
            return Response(
                {"message": "Изображение и все связанные результаты успешно удалены"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Ошибка при удалении изображения: {str(e)}")
            
            return Response(
                {"error": "Ошибка при удалении изображения"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
