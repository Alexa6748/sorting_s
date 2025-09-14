from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import json
import logging

logger = logging.getLogger(__name__)

class FrontendMetricsView(APIView):
    """
    API endpoint for receiving frontend metrics
    """
    def post(self, request):
        try:
            # Get metrics data from request
            metrics_data = request.data
            
            # Log the metrics (in production, you might want to store these in a database)
            logger.info(f"Frontend metrics received: {json.dumps(metrics_data)}")
            
            # Here you could store the metrics in a database or send them to Prometheus
            # For now, we'll just log them
            
            return Response(
                {"message": "Metrics received successfully"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Error processing frontend metrics: {str(e)}")
            return Response(
                {"error": "Failed to process metrics"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )