# core/tests.py
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from .models import UploadedImage

class CoreModelTests(TestCase):
    """Test cases for core models."""

    def test_uploaded_image_creation(self):
        """Test UploadedImage model creation."""
        # Create a simple image file
        image_content = b"fake image content"
        image_file = SimpleUploadedFile(
            "test_image.jpg",
            image_content,
            content_type="image/jpeg"
        )
        
        uploaded_image = UploadedImage.objects.create(
            image=image_file
        )
        
        self.assertIsNotNone(uploaded_image.id)
        # Check that the original filename is part of the stored filename
        self.assertIn("test_image", str(uploaded_image))
        self.assertIn("test_image", uploaded_image.image.name)