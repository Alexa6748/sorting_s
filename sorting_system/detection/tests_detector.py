# detection/tests_detector.py
from django.test import TestCase
from unittest.mock import patch, MagicMock
import numpy as np
import cv2
from .detector import Detector

class DetectorTests(TestCase):
    """Test cases for Detector class."""

    def setUp(self):
        """Set up test dependencies."""
        pass

    @patch('detection.detector.YOLO')
    @patch('detection.detector.settings')
    def test_detector_initialization(self, mock_settings, mock_yolo):
        """Test Detector initialization."""
        # Mock settings
        mock_settings.BASE_DIR = '/fake/path'
        
        # Create detector instance
        detector = Detector()
        
        # Check that YOLO was called with correct path
        mock_yolo.assert_called_once()
        
        # Check that class_names was set
        self.assertIsNotNone(detector.class_names)

    @patch('detection.detector.YOLO')
    def test_predict_method_with_detections(self, mock_yolo):
        """Test predict method with detections."""
        # Create mock detection results
        mock_box = MagicMock()
        mock_box.xyxy[0].cpu().numpy.return_value = np.array([10, 20, 100, 200])
        mock_box.cls[0].item.return_value = 1
        mock_box.conf[0].item.return_value = 0.85
        
        mock_boxes = MagicMock()
        mock_boxes.boxes = [mock_box]
        
        mock_result = MagicMock()
        mock_result.boxes = [mock_box]
        
        # Configure the mock YOLO model
        mock_model = MagicMock()
        mock_model.predict.return_value = [mock_result]
        mock_model.names = {0: 'class0', 1: 'bottle', 2: 'class2'}
        mock_yolo.return_value = mock_model
        
        # Create detector instance
        detector = Detector()
        
        # Create a test image
        test_image = np.zeros((416, 416, 3), dtype=np.uint8)
        
        # Call predict method
        detections = detector.predict(test_image)
        
        # Verify results
        self.assertEqual(len(detections), 1)
        self.assertEqual(detections[0]['box'], [10, 20, 100, 200])
        self.assertEqual(detections[0]['class_name'], 'bottle')
        self.assertEqual(detections[0]['confidence'], 0.85)

    @patch('detection.detector.YOLO')
    def test_predict_method_no_detections(self, mock_yolo):
        """Test predict method with no detections."""
        # Configure the mock YOLO model to return empty results
        mock_result = MagicMock()
        mock_result.boxes = []
        
        mock_model = MagicMock()
        mock_model.predict.return_value = [mock_result]
        mock_model.names = {0: 'class0', 1: 'class1'}
        mock_yolo.return_value = mock_model
        
        # Create detector instance
        detector = Detector()
        
        # Create a test image
        test_image = np.zeros((416, 416, 3), dtype=np.uint8)
        
        # Call predict method
        detections = detector.predict(test_image)
        
        # Verify results
        self.assertEqual(len(detections), 0)

    @patch('detection.detector.YOLO')
    def test_predict_method_multiple_detections(self, mock_yolo):
        """Test predict method with multiple detections."""
        # Create mock detection results
        mock_boxes = []
        for i in range(3):
            mock_box = MagicMock()
            mock_box.xyxy[0].cpu().numpy.return_value = np.array([10*i, 20*i, 100*i+50, 200*i+50])
            mock_box.cls[0].item.return_value = i
            mock_box.conf[0].item.return_value = 0.80 - i*0.1
            mock_boxes.append(mock_box)
        
        mock_result = MagicMock()
        mock_result.boxes = mock_boxes
        
        # Configure the mock YOLO model
        mock_model = MagicMock()
        mock_model.predict.return_value = [mock_result]
        mock_model.names = {0: 'bottle', 1: 'can', 2: 'box'}
        mock_yolo.return_value = mock_model
        
        # Create detector instance
        detector = Detector()
        
        # Create a test image
        test_image = np.zeros((416, 416, 3), dtype=np.uint8)
        
        # Call predict method
        detections = detector.predict(test_image)
        
        # Verify results
        self.assertEqual(len(detections), 3)
        for i, detection in enumerate(detections):
            self.assertEqual(detection['box'], [10*i, 20*i, 100*i+50, 200*i+50])
            self.assertEqual(detection['class_name'], mock_model.names[i])
            self.assertEqual(detection['confidence'], 0.80 - i*0.1)

    def test_draw_detections_method(self):
        """Test draw_detections method."""
        # Create detector instance (we don't need to mock YOLO for this test)
        detector = Detector()
        
        # Create a test image
        test_image = np.zeros((416, 416, 3), dtype=np.uint8)
        
        # Define test detections
        detections = [
            {
                'box': [50, 50, 200, 200],
                'class_name': 'bottle',
                'confidence': 0.85
            },
            {
                'box': [250, 100, 350, 300],
                'class_name': 'can',
                'confidence': 0.75
            }
        ]
        
        # Call draw_detections method
        result_image = detector.draw_detections(test_image.copy(), detections)
        
        # Verify that the image was modified (not exactly the same)
        # Note: We can't easily check the exact drawing, but we can verify
        # that the function executes without error and returns an image
        self.assertIsNotNone(result_image)
        self.assertEqual(result_image.shape, test_image.shape)

    @patch('detection.detector.YOLO')
    def test_predict_method_with_cv2_error(self, mock_yolo):
        """Test predict method handles errors gracefully."""
        # Configure the mock YOLO model to raise an exception
        mock_model = MagicMock()
        mock_model.predict.side_effect = Exception("Model error")
        mock_model.names = {0: 'class0'}
        mock_yolo.return_value = mock_model
        
        # Create detector instance
        detector = Detector()
        
        # Create a test image
        test_image = np.zeros((416, 416, 3), dtype=np.uint8)
        
        # Call predict method and verify it handles the error
        with self.assertRaises(Exception):
            detector.predict(test_image)