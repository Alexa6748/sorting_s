from django.urls import path, include
from .views import ClassifyAPIView, DetectObjectsView

urlpatterns = [
    path('classify/', ClassifyAPIView.as_view(), name='classify'),
    path('classify/<int:image_id>/', ClassifyAPIView.as_view(), name='delete_classification'),
    path('detect/', DetectObjectsView.as_view(), name='detect'),
    path('detect/<int:image_id>/', DetectObjectsView.as_view(), name='delete_detection'),
]