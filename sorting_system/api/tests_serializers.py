# api/tests_serializers.py
from django.test import TestCase
from .serializers import ClassificationSerializer, DetectionSerializer, DetectionResponseSerializer

class APISerializerTests(TestCase):
    """Test cases for API serializers."""

    def test_classification_serializer_can_be_instantiated(self):
        """Test that ClassificationSerializer can be instantiated."""
        serializer = ClassificationSerializer()
        self.assertIsNotNone(serializer)
        
    def test_detection_serializer_can_be_instantiated(self):
        """Test that DetectionSerializer can be instantiated."""
        serializer = DetectionSerializer()
        self.assertIsNotNone(serializer)
        
    def test_detection_response_serializer_can_be_instantiated(self):
        """Test that DetectionResponseSerializer can be instantiated."""
        serializer = DetectionResponseSerializer()
        self.assertIsNotNone(serializer)