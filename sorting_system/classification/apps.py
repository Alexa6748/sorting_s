from django.apps import AppConfig
from .classifier import Classifier

class ClassificationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'classification'
     
    def ready(self):
        # Инициализируем классификатор при запуске приложения
        self.classifier = Classifier()
        if self.classifier.initialized:
            print("Классификатор успешно инициализирован")
        else:
            print("Не удалось инициализировать классификатор")