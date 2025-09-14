from django.apps import AppConfig

class DetectionConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'detection'
    
    def ready(self):
        # Importing the detector here to avoid AppRegistryNotReady exception
        from .detector import Detector
        # Initialize the detector
        self.detector = Detector()
