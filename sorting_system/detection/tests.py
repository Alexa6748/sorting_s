# detection/tests.py
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from core.models import UploadedImage
from .models import DetectionResult

class DetectionModelTests(TestCase):
    """Test cases for detection models."""

    def test_detection_result_creation(self):
        """Test DetectionResult model creation."""
        # Create an uploaded image first
        image_content = b"fake image content"
        image_file = SimpleUploadedFile(
            "test_image.jpg",
            image_content,
            content_type="image/jpeg"
        )
        
        uploaded_image = UploadedImage.objects.create(
            image=image_file
        )
        
        # Create detection result
        detection_result = DetectionResult.objects.create(
            image=uploaded_image,
            x_min=10,
            y_min=20,
            x_max=100,
            y_max=200,
            confidence=0.85
        )
        
        self.assertIsNotNone(detection_result.id)
        self.assertEqual(detection_result.x_min, 10)
        self.assertEqual(detection_result.y_min, 20)
        self.assertEqual(detection_result.x_max, 100)
        self.assertEqual(detection_result.y_max, 200)
        self.assertEqual(detection_result.confidence, 0.85)
        self.assertEqual(detection_result.image, uploaded_image)