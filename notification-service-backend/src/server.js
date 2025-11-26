require('dotenv').config();
const express = require('express');
const cors = require('cors');

const notificationRoutes = require('./routes/notificationRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/notifications', notificationRoutes);
app.use('/health', healthRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Notification Service',
    status: 'running',
    port: process.env.PORT
  });
});

// Start server with port conflict handling
const PORT = process.env.PORT || 3004;

const startServer = () => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Notification Service running on port ${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/health`);
    console.log(`📧 API: http://localhost:${PORT}/api/notifications`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`❌ Port ${PORT} is busy. Trying ${Number(PORT) + 1}...`);
      setTimeout(() => {
        startServer(Number(PORT) + 1);
      }, 1000);
    } else {
      console.error('Server error:', error);
    }
  });
};

startServer();

module.exports = app;