# detection/models.py
from django.db import models
from core.models import UploadedImage

class DetectionResult(models.Model):
    image = models.ForeignKey(UploadedImage, on_delete=models.CASCADE)
    x_min = models.IntegerField()
    y_min = models.IntegerField()
    x_max = models.IntegerField()
    y_max = models.IntegerField()
    confidence = models.FloatField()
    detected_at = models.DateTimeField(auto_now_add=True)