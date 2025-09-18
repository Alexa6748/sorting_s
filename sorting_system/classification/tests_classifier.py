# classification/tests_classifier.py
from django.test import TestCase
from unittest.mock import patch, MagicMock
import numpy as np
from PIL import Image
import torch
from .classifier import Classifier

class ClassifierTests(TestCase):
    """Test cases for Classifier class."""

    @patch('classification.classifier.os.path.exists')
    @patch('classification.classifier.torch.load')
    @patch('classification.classifier.timm.create_model')
    @patch('classification.classifier.settings')
    def test_classifier_initialization_success(self, mock_settings, mock_create_model, mock_torch_load, mock_path_exists):
        """Test successful Classifier initialization."""
        # Mock dependencies
        mock_settings.BASE_DIR = '/fake/path'
        mock_path_exists.return_value = True
        mock_model = MagicMock()
        mock_create_model.return_value = mock_model
        mock_torch_load.return_value = {'state': 'dict'}
        
        # Create classifier instance
        classifier = Classifier()
        
        # Verify initialization
        self.assertTrue(classifier.initialized)
        mock_create_model.assert_called_once_with("convnextv2_base", pretrained=False, num_classes=6)
        mock_torch_load.assert_called_once()
        mock_model.load_state_dict.assert_called_once()
        mock_model.eval.assert_called_once()
        
        # Check classes
        expected_classes = ['cardboard', 'glass', 'metal', 'paper', 'plastic', 'trash']
        self.assertEqual(classifier.classes, expected_classes)

    @patch('classification.classifier.os.path.exists')
    @patch('classification.classifier.settings')
    def test_classifier_initialization_file_not_found(self, mock_settings, mock_path_exists):
        """Test Classifier initialization when model file is not found."""
        # Mock dependencies
        mock_settings.BASE_DIR = '/fake/path'
        mock_path_exists.return_value = False  # Model file doesn't exist
        
        # Create classifier instance
        classifier = Classifier()
        
        # Verify initialization failed
        self.assertFalse(classifier.initialized)

    @patch('classification.classifier.os.path.exists')
    @patch('classification.classifier.torch.load')
    @patch('classification.classifier.timm.create_model')
    @patch('classification.classifier.settings')
    def test_classifier_initialization_exception(self, mock_settings, mock_create_model, mock_torch_load, mock_path_exists):
        """Test Classifier initialization when an exception occurs."""
        # Mock dependencies
        mock_settings.BASE_DIR = '/fake/path'
        mock_path_exists.return_value = True
        mock_create_model.side_effect = Exception("Model creation failed")
        
        # Create classifier instance
        classifier = Classifier()
        
        # Verify initialization failed
        self.assertFalse(classifier.initialized)

    def test_preprocess_image_with_numpy_array(self):
        """Test preprocess_image method with numpy array input."""
        # Create a mock classifier (we don't need full initialization for this test)
        classifier = Classifier()
        
        # Mock the transform
        mock_transform = MagicMock()
        mock_transform.return_value = torch.randn(3, 224, 224)
        classifier.transform = mock_transform
        
        # Create a test numpy array image
        rng = np.random.default_rng(42)
        test_image = rng.integers(0, 255, (300, 300, 3), dtype=np.uint8)
        
        # Call preprocess_image method
        result = classifier.preprocess_image(test_image)
        
        # Verify results
        mock_transform.assert_called_once()
        self.assertEqual(result.shape[0], 1)  # Batch dimension should be added

    def test_preprocess_image_with_pil_image(self):
        """Test preprocess_image method with PIL Image input."""
        # Create a mock classifier
        classifier = Classifier()
        
        # Mock the transform
        mock_transform = MagicMock()
        mock_transform.return_value = torch.randn(3, 224, 224)
        classifier.transform = mock_transform
        
        # Create a test PIL image
        test_image = Image.new('RGB', (300, 300), color='red')
        
        # Call preprocess_image method
        result = classifier.preprocess_image(test_image)
        
        # Verify results
        mock_transform.assert_called_once()
        self.assertEqual(result.shape[0], 1)  # Batch dimension should be added

    @patch('classification.classifier.torch')
    def test_predict_not_initialized(self, mock_torch):
        """Test predict method when classifier is not initialized."""
        # Create a classifier that's not initialized
        classifier = Classifier()
        classifier.initialized = False
        
        # Create a test image
        rng = np.random.default_rng(42)
        test_image = rng.integers(0, 255, (300, 300, 3), dtype=np.uint8)
        
        # Call predict method
        class_name, confidence = classifier.predict(test_image)
        
        # Verify results
        self.assertEqual(class_name, "model_error")
        self.assertEqual(confidence, 0.0)

    @patch('classification.classifier.torch')
    def test_predict_success(self, mock_torch):
        """Test successful prediction."""
        # Create a mock classifier
        classifier = Classifier()
        classifier.initialized = True
        classifier.classes = ['cardboard', 'glass', 'metal', 'paper', 'plastic', 'trash']
        
        # Mock preprocess_image
        classifier.preprocess_image = MagicMock(return_value=torch.randn(1, 3, 224, 224))
        
        # Mock model
        mock_model = MagicMock()
        mock_model.return_value = torch.tensor([[1.0, 2.0, 0.5, 0.3, 1.5, 0.1]])
        classifier.model = mock_model
        
        # Mock torch functions
        mock_softmax = MagicMock(return_value=torch.tensor([0.1, 0.4, 0.2, 0.1, 0.15, 0.05]))
        mock_torch.nn.functional.softmax = mock_softmax
        mock_torch.max.return_value = (torch.tensor(0.4), torch.tensor(1))
        
        # Create a test image
        rng = np.random.default_rng(42)
        test_image = rng.integers(0, 255, (300, 300, 3), dtype=np.uint8)
        
        # Call predict method
        class_name, confidence = classifier.predict(test_image)
        
        # Verify results
        self.assertEqual(class_name, "glass")  # Index 1 corresponds to "glass"
        self.assertAlmostEqual(confidence, 0.4, places=6)

    @patch('classification.classifier.torch')
    def test_predict_exception(self, mock_torch):
        """Test predict method when an exception occurs."""
        # Create a mock classifier
        classifier = Classifier()
        classifier.initialized = True
        
        # Mock preprocess_image to raise an exception
        classifier.preprocess_image = MagicMock(side_effect=Exception("Preprocessing error"))
        
        # Create a test image
        rng = np.random.default_rng(42)
        test_image = rng.integers(0, 255, (300, 300, 3), dtype=np.uint8)
        
        # Call predict method
        class_name, confidence = classifier.predict(test_image)
        
        # Verify results
        self.assertEqual(class_name, "error")
        self.assertEqual(confidence, 0.0)