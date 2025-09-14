import cv2
import numpy as np
from ultralytics import YOLO
from django.conf import settings
import os

class Detector:
    def __init__(self):
        # Загрузка модели детекции
        model_path = os.path.join(settings.BASE_DIR, 'detection', 'weights', 'best_2.pt')
        self.detection_model = YOLO(model_path)
        
        # Получаем имена классов из модели YOLO
        self.class_names = self.detection_model.names
    
    def predict(self, image):
        # Детекция объектов
        results = self.detection_model.predict(image, conf=0.5)
        detections = []
        
        for result in results:
            for box in result.boxes:
                # Получаем координаты bounding box
                x1, y1, x2, y2 = map(int, box.xyxy[0].cpu().numpy())
                
                # Получаем индекс класса и уверенность детекции
                class_idx = int(box.cls[0].item())
                confidence = float(box.conf[0].item())
                
                # Получаем имя класса по индексу
                class_name = self.class_names[class_idx]
                
                detections.append({
                    'box': [x1, y1, x2, y2],
                    'class_name': class_name,
                    'confidence': confidence
                })
        
        return detections
    
    def draw_detections(self, image, detections):
        # Рисуем bounding boxes и подписи
        for detection in detections:
            x1, y1, x2, y2 = detection['box']
            class_name = detection['class_name']
            confidence = detection['confidence']
            
            # Рисуем прямоугольник
            cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
            # Добавляем подпись
            label = f"{class_name} {confidence:.2f}"
            cv2.putText(image, label, (x1, y1 - 10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        return image