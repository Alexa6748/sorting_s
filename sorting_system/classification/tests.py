# classification/tests.py
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from core.models import UploadedImage
from .models import ClassificationResult

class ClassificationModelTests(TestCase):
    """Test cases for classification models."""

    def test_classification_result_creation(self):
        """Test ClassificationResult model creation."""
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
        
        # Create classification result
        classification_result = ClassificationResult.objects.create(
            image=uploaded_image,
            material="plastic",
            confidence=0.95
        )
        
        self.assertIsNotNone(classification_result.id)
        self.assertEqual(classification_result.material, "plastic")
        self.assertEqual(classification_result.confidence, 0.95)
        self.assertEqual(classification_result.image, uploaded_image)