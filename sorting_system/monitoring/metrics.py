import time
from prometheus_client import Counter, Histogram, Gauge

CLASSIFICATION_REQUESTS = Counter(
    'sorting_system_classification_requests_total',
    'Total number of classification requests',
    ['status']
)

DETECTION_REQUESTS = Counter(
    'sorting_system_detection_requests_total',
    'Total number of detection requests',
    ['status']
)

CLASSIFICATION_PROCESSING_TIME = Histogram(
    'sorting_system_classification_processing_seconds',
    'Time spent processing classification requests'
)

DETECTION_PROCESSING_TIME = Histogram(
    'sorting_system_detection_processing_seconds',
    'Time spent processing detection requests'
)

CURRENTLY_PROCESSING_CLASSIFICATIONS = Gauge(
    'sorting_system_currently_processing_classifications',
    'Number of classifications currently being processed'
)

CURRENTLY_PROCESSING_DETECTIONS = Gauge(
    'sorting_system_currently_processing_detections',
    'Number of detections currently being processed'
)

MODEL_INFERENCE_COUNT = Counter(
    'sorting_system_model_inference_total',
    'Total number of model inference operations',
    ['model_type']
)

# ccccc