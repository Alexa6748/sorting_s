# api/tests.py
from django.test import TestCase
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from unittest.mock import patch, MagicMock
import numpy as np
import cv2

class APITests(TestCase):
    """Test cases for API endpoints."""

    def test_classify_api_view_get(self):
        """Test that GET request to classify endpoint returns 405."""
        url = '/api/classify/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 405)  # Method not allowed

    def test_detect_api_view_get(self):
        """Test that GET request to detect endpoint returns 405."""
        url = '/api/detect/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 405)  # Method not allowed

    @patch('api.views.apps.get_app_config')
    def test_classify_api_view_post_no_image(self, mock_get_app_config):
        """Test that POST request without image returns 400."""
        # Mock the classifier app config
        mock_app_config = MagicMock()
        mock_app_config.classifier.initialized = True
        mock_get_app_config.return_value = mock_app_config
        
        url = '/api/classify/'
        response = self.client.post(url, {})
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn('error', data)

    @patch('api.views.apps.get_app_config')
    def test_detect_api_view_post_no_image(self, mock_get_app_config):
        """Test that POST request without image returns 400."""
        # Mock the detection app config
        mock_app_config = MagicMock()
        mock_get_app_config.return_value = mock_app_config
        
        url = '/api/detect/'
        response = self.client.post(url, {})
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn('error', data)

    def test_classify_api_view_delete_requires_image_id(self):
        """Test that DELETE request with non-existent image_id returns 500."""
        url = '/api/classify/99999/'
        response = self.client.delete(url)
        # Should return 500 for non-existent image (based on current implementation)
        self.assertEqual(response.status_code, 500)

    def test_detect_api_view_delete_requires_image_id(self):
        """Test that DELETE request with non-existent image_id returns 500."""
        url = '/api/detect/99999/'
        response = self.client.delete(url)
        # Should return 500 for non-existent image (based on current implementation)
        self.assertEqual(response.status_code, 500)

    @patch('api.views.apps.get_app_config')
    @patch('api.views.cv2')
    def test_classify_api_view_post_success(self, mock_cv2, mock_get_app_config):
        """Test successful image classification."""
        # Create a mock image
        mock_image = np.zeros((100, 100, 3), dtype=np.uint8)
        mock_cv2.imdecode.return_value = mock_image
        
        # Mock the classifier app config
        mock_classifier = MagicMock()
        mock_classifier.initialized = True
        mock_classifier.predict.return_value = ("plastic", 0.95)
        
        mock_app_config = MagicMock()
        mock_app_config.classifier = mock_classifier
        mock_get_app_config.return_value = mock_app_config
        
        # Create a test image file
        image_content = b"fake image content"
        image_file = SimpleUploadedFile(
            "test_image.jpg",
            image_content,
            content_type="image/jpeg"
        )
        
        url = '/api/classify/'
        response = self.client.post(url, {'image': image_file})
        
        # Check that we get a successful response
        self.assertEqual(response.status_code, 200)
        
        # Check that the response contains expected data
        data = response.json()
        self.assertIn('class_name', data)
        self.assertIn('confidence', data)
        self.assertEqual(data['class_name'], 'plastic')
        self.assertEqual(data['confidence'], 0.95)

    @patch('api.views.apps.get_app_config')
    @patch('api.views.cv2')
    def test_detect_api_view_post_success(self, mock_cv2, mock_get_app_config):
        """Test successful object detection."""
        # Create a mock image
        mock_image = np.zeros((100, 100, 3), dtype=np.uint8)
        mock_cv2.imdecode.return_value = mock_image
        mock_cv2.cvtColor.return_value = mock_image
        
        # Mock the detector app config
        mock_detector = MagicMock()
        mock_detector.predict.return_value = [
            {
                'box': [10, 10, 50, 50],
                'class_name': 'bottle',
                'confidence': 0.85
            }
        ]
        mock_detector.draw_detections.return_value = mock_image
        
        mock_app_config = MagicMock()
        mock_app_config.detector = mock_detector
        mock_get_app_config.return_value = mock_app_config
        
        # Mock cv2.imencode
        mock_cv2.imencode.return_value = (True, np.array([1, 2, 3], dtype=np.uint8))
        
        # Create a test image file
        image_content = b"fake image content"
        image_file = SimpleUploadedFile(
            "test_image.jpg",
            image_content,
            content_type="image/jpeg"
        )
        
        url = '/api/detect/'
        response = self.client.post(url, {'image': image_file})
        
        # Check that we get a successful response
        self.assertEqual(response.status_code, 200)
        
        # Check that the response contains expected data
        data = response.json()
        self.assertIn('detections', data)
        self.assertIn('processed_image_base64', data)
        self.assertTrue(len(data['detections']) > 0)

    @patch('api.views.apps.get_app_config')
    def test_classify_api_view_post_classifier_not_initialized(self, mock_get_app_config):
        """Test classification when classifier is not initialized."""
        # Mock the classifier app config
        mock_classifier = MagicMock()
        mock_classifier.initialized = False  # Not initialized
        
        mock_app_config = MagicMock()
        mock_app_config.classifier = mock_classifier
        mock_get_app_config.return_value = mock_app_config
        
        # Create a test image file
        image_content = b"fake image content"
        image_file = SimpleUploadedFile(
            "test_image.jpg",
            image_content,
            content_type="image/jpeg"
        )
        
        url = '/api/classify/'
        response = self.client.post(url, {'image': image_file})
        
        # Check that we get a service unavailable response
        self.assertEqual(response.status_code, 503)
        data = response.json()
        self.assertIn('error', data)

    @patch('api.views.apps.get_app_config')
    @patch('api.views.cv2')
    def test_classify_api_view_post_image_decode_failure(self, mock_cv2, mock_get_app_config):
        """Test classification when image decoding fails."""
        # Mock cv2 to return None (simulating decode failure)
        mock_cv2.imdecode.return_value = None
        
        # Mock the classifier app config
        mock_classifier = MagicMock()
        mock_classifier.initialized = True
        
        mock_app_config = MagicMock()
        mock_app_config.classifier = mock_classifier
        mock_get_app_config.return_value = mock_app_config
        
        # Create a test image file
        image_content = b"invalid image content"
        image_file = SimpleUploadedFile(
            "test_image.jpg",
            image_content,
            content_type="image/jpeg"
        )
        
        url = '/api/classify/'
        response = self.client.post(url, {'image': image_file})
        
        # Check that we get a bad request response
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn('error', data)

    @patch('api.views.apps.get_app_config')
    def test_classify_api_view_put_success(self, mock_get_app_config):
        """Test successful update of classification result."""
        # First create a test image and classification result
        from core.models import UploadedImage
        from classification.models import ClassificationResult
        from django.core.files.uploadedfile import SimpleUploadedFile
        
        # Create an uploaded image
        image_content = b"fake image content"
        image_file = SimpleUploadedFile(
            "test_image.jpg",
            image_content,
            content_type="image/jpeg"
        )
        
        uploaded_image = UploadedImage.objects.create(image=image_file)
        classification_result = ClassificationResult.objects.create(
            image=uploaded_image,
            material="plastic",
            confidence=0.95
        )
        
        url = f'/api/classify/{uploaded_image.id}/'
        response = self.client.put(
            url, 
            {'is_wrong': True},
            content_type='application/json'
        )
        
        # Check that we get a successful response
        self.assertEqual(response.status_code, 200)
        
        # Check that the response contains expected data
        data = response.json()
        self.assertIn('is_wrong', data)
        self.assertTrue(data['is_wrong'])

    @patch('api.views.apps.get_app_config')
    def test_classify_api_view_put_missing_is_wrong(self, mock_get_app_config):
        """Test PUT request without is_wrong field."""
        # First create a test image and classification result
        from core.models import UploadedImage
        from classification.models import ClassificationResult
        from django.core.files.uploadedfile import SimpleUploadedFile
        
        # Create an uploaded image
        image_content = b"fake image content"
        image_file = SimpleUploadedFile(
            "test_image.jpg",
            image_content,
            content_type="image/jpeg"
        )
        
        uploaded_image = UploadedImage.objects.create(image=image_file)
        classification_result = ClassificationResult.objects.create(
            image=uploaded_image,
            material="plastic",
            confidence=0.95
        )
        
        url = f'/api/classify/{uploaded_image.id}/'
        response = self.client.put(
            url, 
            {},  # Missing is_wrong field
            content_type='application/json'
        )
        
        # Check that we get a bad request response
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn('error', data)

    def test_classify_api_view_put_nonexistent_image(self):
        """Test PUT request for non-existent image."""
        url = '/api/classify/99999/'
        response = self.client.put(
            url, 
            {'is_wrong': True},
            content_type='application/json'
        )
        
        # Check that we get a not found response
        self.assertEqual(response.status_code, 404)
        data = response.json()
        self.assertIn('error', data)

    @patch('api.views.get_object_or_404')
    def test_classify_api_view_delete_success(self, mock_get_object_or_404):
        """Test successful deletion of classification result."""
        # Create a mock uploaded image
        mock_uploaded_image = MagicMock()
        mock_get_object_or_404.return_value = mock_uploaded_image
        
        url = '/api/classify/1/'
        response = self.client.delete(url)
        
        # Check that we get a successful response
        self.assertEqual(response.status_code, 200)
        
        # Check that delete was called on the image
        mock_uploaded_image.delete.assert_called_once()

    @patch('api.views.get_object_or_404')
    def test_detect_api_view_delete_success(self, mock_get_object_or_404):
        """Test successful deletion of detection result."""
        # Create a mock uploaded image
        mock_uploaded_image = MagicMock()
        mock_get_object_or_404.return_value = mock_uploaded_image
        
        url = '/api/detect/1/'
        response = self.client.delete(url)
        
        # Check that we get a successful response
        self.assertEqual(response.status_code, 200)
        
        # Check that delete was called on the image
        mock_uploaded_image.delete.assert_called_once()