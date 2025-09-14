// frontend/src/utils/metricsServer.js
import express from 'express';
import { register } from './metrics';

const app = express();

// Endpoint to expose metrics
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

export default app;