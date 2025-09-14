# api/tests.py
from django.test import TestCase
from django.urls import reverse
from unittest.mock import patch, MagicMock

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