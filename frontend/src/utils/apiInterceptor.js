// frontend/src/utils/apiInterceptor.js
import axios from 'axios';
import frontendMetrics from './metrics';

// Add a request interceptor
axios.interceptors.request.use(
  function (config) {
    // Add start time to config
    config.metadata = { startTime: new Date() };
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axios.interceptors.response.use(
  function (response) {
    // Calculate request duration
    if (response.config.metadata) {
      const duration = new Date() - response.config.metadata.startTime;
      
      // Record metrics
      frontendMetrics.recordHttpRequestDuration(
        response.config.method.toUpperCase(),
        response.config.url,
        response.status,
        duration
      );
      
      frontendMetrics.incrementHttpRequestTotal(
        response.config.method.toUpperCase(),
        response.config.url,
        response.status
      );
    }
    
    return response;
  },
  function (error) {
    // Record error metrics
    if (error.config && error.config.metadata) {
      const duration = new Date() - error.config.metadata.startTime;
      const status = error.response ? error.response.status : 'error';
      
      frontendMetrics.recordHttpRequestDuration(
        error.config.method.toUpperCase(),
        error.config.url,
        status,
        duration
      );
      
      frontendMetrics.incrementHttpRequestTotal(
        error.config.method.toUpperCase(),
        error.config.url,
        status
      );
    }
    
    return Promise.reject(error);
  }
);