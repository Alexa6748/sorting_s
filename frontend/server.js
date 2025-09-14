// frontend/server.js
const express = require('express');
const path = require('path');
const { register } = require('prom-client');

const app = express();
const PORT = process.env.METRICS_PORT || 9000;

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build')));

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});