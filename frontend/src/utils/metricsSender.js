// frontend/src/utils/metricsSender.js
import axios from 'axios';
import frontendMetrics from './metrics';

class MetricsSender {
  constructor() {
    this.sendInterval = 30000; // Send metrics every 30 seconds
    this.intervalId = null;
  }
  
  // Start sending metrics periodically
  startSending() {
    this.intervalId = setInterval(() => {
      this.sendMetrics();
    }, this.sendInterval);
  }
  
  // Stop sending metrics
  stopSending() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  // Send metrics to backend
  async sendMetrics() {
    try {
      const metrics = frontendMetrics.getMetrics();
      
      // Only send if we have metrics to send
      if (this.hasMetrics(metrics)) {
        await axios.post('/api/frontend-metrics/', metrics);
        console.log('Metrics sent successfully');
        
        // Reset metrics after sending
        frontendMetrics.resetMetrics();
      }
    } catch (error) {
      console.error('Error sending metrics:', error);
    }
  }
  
  // Check if we have any metrics to send
  hasMetrics(metrics) {
    return (
      metrics.httpRequestDuration.length > 0 ||
      Object.keys(metrics.httpRequestTotal).length > 0 ||
      Object.keys(metrics.frontendErrorsTotal).length > 0 ||
      Object.keys(metrics.userInteractionsTotal).length > 0 ||
      Object.keys(metrics.imageUploadsTotal).length > 0 ||
      Object.keys(metrics.modelRequestsTotal).length > 0
    );
  }
}

// Create a singleton instance
const metricsSender = new MetricsSender();

export default metricsSender;