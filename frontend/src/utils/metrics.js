// frontend/src/utils/metrics.js
// Client-side metrics collection for the frontend

class FrontendMetrics {
  constructor() {
    this.metrics = {
      httpRequestDuration: [],
      httpRequestTotal: {},
      frontendErrorsTotal: {},
      userInteractionsTotal: {},
      imageUploadsTotal: {},
      modelRequestsTotal: {}
    };
    
    // Initialize metrics
    this.initMetrics();
  }
  
  initMetrics() {
    // We'll store metrics in memory for now
    // In a production environment, these would be sent to a backend service
  }
  
  // Record HTTP request duration
  recordHttpRequestDuration(method, route, code, duration) {
    this.metrics.httpRequestDuration.push({
      method,
      route,
      code,
      duration,
      timestamp: new Date().toISOString()
    });
    
    console.log(`HTTP Request: ${method} ${route} ${code} - ${duration}ms`);
  }
  
  // Record HTTP request count
  incrementHttpRequestTotal(method, route, code) {
    const key = `${method}:${route}:${code}`;
    this.metrics.httpRequestTotal[key] = (this.metrics.httpRequestTotal[key] || 0) + 1;
    
    console.log(`HTTP Request Total: ${method} ${route} ${code} - Count: ${this.metrics.httpRequestTotal[key]}`);
  }
  
  // Record frontend errors
  incrementFrontendErrorsTotal(type, location) {
    const key = `${type}:${location}`;
    this.metrics.frontendErrorsTotal[key] = (this.metrics.frontendErrorsTotal[key] || 0) + 1;
    
    console.log(`Frontend Error: ${type} at ${location} - Count: ${this.metrics.frontendErrorsTotal[key]}`);
  }
  
  // Record user interactions
  incrementUserInteractionsTotal(type, element) {
    const key = `${type}:${element}`;
    this.metrics.userInteractionsTotal[key] = (this.metrics.userInteractionsTotal[key] || 0) + 1;
    
    console.log(`User Interaction: ${type} on ${element} - Count: ${this.metrics.userInteractionsTotal[key]}`);
  }
  
  // Record image uploads
  incrementImageUploadsTotal(type, status) {
    const key = `${type}:${status}`;
    this.metrics.imageUploadsTotal[key] = (this.metrics.imageUploadsTotal[key] || 0) + 1;
    
    console.log(`Image Upload: ${type} ${status} - Count: ${this.metrics.imageUploadsTotal[key]}`);
  }
  
  // Record model requests
  incrementModelRequestsTotal(operation, status) {
    const key = `${operation}:${status}`;
    this.metrics.modelRequestsTotal[key] = (this.metrics.modelRequestsTotal[key] || 0) + 1;
    
    console.log(`Model Request: ${operation} ${status} - Count: ${this.metrics.modelRequestsTotal[key]}`);
  }
  
  // Get all metrics (for debugging)
  getMetrics() {
    return this.metrics;
  }
  
  // Reset metrics
  resetMetrics() {
    this.metrics = {
      httpRequestDuration: [],
      httpRequestTotal: {},
      frontendErrorsTotal: {},
      userInteractionsTotal: {},
      imageUploadsTotal: {},
      modelRequestsTotal: {}
    };
  }
}

// Create a singleton instance
const frontendMetrics = new FrontendMetrics();

export default frontendMetrics;