// ✅ ADD THIS AT THE VERY TOP - Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const notificationRoutes = require('./routes/notificationRoutes');
const websocketServer = require('./websocket/websocketServer');

const app = express();
const PORT = process.env.PORT || 3004;

// Debug: Check if environment variables are loaded
console.log('🔧 Environment Variables Status:');
console.log('   PORT:', process.env.PORT || 'Using default (3004)');
console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Loaded' : '❌ Missing');
console.log('   SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Loaded' : '❌ Missing');
console.log('   RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Loaded' : '❌ Missing');

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server for WebSocket support
const server = http.createServer(app);

// Initialize WebSocket server
websocketServer.initialize(server);

// Routes
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'healthy',
      websocket: {
        connectedClients: websocketServer.getConnectedClients(),
        status: 'running'
      },
      server: 'healthy'
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// WebSocket status endpoint
app.get('/websocket-status', (req, res) => {
  res.json({
    connectedClients: websocketServer.getConnectedClients(),
    status: 'active',
    endpoint: 'ws://localhost:3004/ws'
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Notification Service running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📧 API Base: http://localhost:${PORT}/api/notifications`);
  console.log(`📡 WebSocket: ws://localhost:${PORT}/ws`);
});

module.exports = { app, server };