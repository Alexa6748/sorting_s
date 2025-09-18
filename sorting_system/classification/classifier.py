import os
import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import numpy as np
from django.conf import settings
import timm

class Classifier:
    def __init__(self):
        self.initialized = False
        try:
            # Путь к модели
            model_path = os.path.join(
                settings.BASE_DIR, 
                'classification', 
                'weights', 
                'best_fine_tuned_weights.pth'
            )
            
            # Проверка существования файла
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Model file not found: {model_path}")
            
            # Создание модели
            self.model = timm.create_model("convnextv2_base", pretrained=False, num_classes=6)
            
            # Загрузка весов
            state_dict = torch.load(model_path, map_location=torch.device('cpu'), weights_only=True)
            self.model.load_state_dict(state_dict)
            
            # Переводим модель в режим оценки
            self.model.eval()
            
            # Классы
            self.classes = ['cardboard', 'glass', 'metal', 'paper', 'plastic', 'trash']
            
            # Трансформации
            self.transform = transforms.Compose([
                transforms.Resize(256),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
            ])
            
            print("Модель классификации успешно загружена!")
            self.initialized = True
        except Exception as e:
            print(f"Ошибка загрузки модели классификации: {e}")
            self.initialized = False

    def preprocess_image(self, image):
        # Конвертируем numpy array в PIL Image
        if isinstance(image, np.ndarray):
            image = Image.fromarray(image)
        
        # Применяем трансформации
        return self.transform(image).unsqueeze(0)  # Добавляем batch dimension

    def predict(self, image):
        if not self.initialized:
            print("Классификатор не инициализирован!")
            return "model_error", 0.0
            
        try:
            # Препроцессинг
            input_tensor = self.preprocess_image(image)
            
            # Предсказание
            with torch.no_grad():
                output = self.model(input_tensor)
                probabilities = torch.nn.functional.softmax(output[0], dim=0)
            
            # Получаем лучший класс и уверенность
            confidence, class_idx = torch.max(probabilities, dim=0)
            class_name = self.classes[class_idx.item()]
            print(f"Результат классификации: {class_name} ({confidence.item():.2f})")
            return class_name, confidence.item()
        except Exception as e:
            print(f"Ошибка классификации: {e}")
            return "error", 0.0