from rest_framework import serializers

class ClassificationSerializer(serializers.Serializer):
    class_name = serializers.CharField(source='class')
    confidence = serializers.FloatField()
    image_id = serializers.IntegerField(required=False)
    is_wrong = serializers.BooleanField(default=False)

    class Meta:
        fields = ['class_name', 'confidence', 'image_id', 'is_wrong']


class DetectionSerializer(serializers.Serializer):
    class_name = serializers.CharField(source='class')
    confidence = serializers.FloatField()
    box = serializers.ListField(child=serializers.IntegerField())

    class Meta:
        fields = ['class_name', 'confidence', 'box']


class DetectionResponseSerializer(serializers.Serializer):
    detections = DetectionSerializer(many=True)
    processed_image_base64 = serializers.CharField()
    image_id = serializers.IntegerField(required=False)

    class Meta:
        fields = ['detections', 'processed_image_base64', 'image_id']