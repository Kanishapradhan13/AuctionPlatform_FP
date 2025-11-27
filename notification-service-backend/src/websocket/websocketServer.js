const WebSocket = require('ws');

class WebSocketServer {
  constructor() {
    this.wss = null;
    this.clients = new Set();
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ 
      server: server,
      path: '/ws'
    });

    this.wss.on('connection', (ws, req) => {
      console.log('📡 WebSocket client connected');
      this.clients.add(ws);

      // Extract user ID from query params if needed
      const url = new URL(req.url, `http://${req.headers.host}`);
      const userId = url.searchParams.get('userId');
      
      if (userId) {
        ws.userId = userId;
        console.log(`👤 WebSocket connected for user: ${userId}`);
      }

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'CONNECTED',
        message: 'Connected to real-time notification service',
        timestamp: new Date().toISOString()
      }));

      ws.on('close', () => {
        console.log('📡 WebSocket client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        this.clients.delete(ws);
      });
    });

    console.log('🚀 WebSocket server running on path /ws');
  }

  // Broadcast to all connected clients
  broadcastToAll(message) {
    const messageString = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      }
    });
  }

  // Send to specific user
  sendToUser(userId, message) {
    const messageString = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && client.userId === userId) {
        client.send(messageString);
      }
    });
  }

  // Send to multiple users
  sendToUsers(userIds, message) {
    const messageString = JSON.stringify(message);
    userIds.forEach(userId => {
      this.sendToUser(userId, message);
    });
  }

  // Get connected clients count
  getConnectedClients() {
    return this.clients.size;
  }
}

module.exports = new WebSocketServer();
