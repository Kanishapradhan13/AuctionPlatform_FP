class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private messageHandlers: Set<(message: any) => void> = new Set();
  public isConnected = false;
  private userId: string | null = null;

  connect(userId: string | null = null) {
    this.userId = userId;
    
    try {
      const wsUrl = userId 
        ? `ws://localhost:3004/ws?userId=${userId}`
        : 'ws://localhost:3004/ws';

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyHandlers({ type: 'CONNECTED', connected: true });
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.notifyHandlers(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('❌ WebSocket disconnected');
        this.isConnected = false;
        this.notifyHandlers({ type: 'DISCONNECTED', connected: false });
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.notifyHandlers({ type: 'ERROR', error: 'Connection error' });
      };

    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(this.userId);
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.notifyHandlers({ type: 'MAX_RECONNECT_ATTEMPTS' });
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  onMessage(handler: (message: any) => void) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  private notifyHandlers(message: any) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  send(message: any) {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected');
    }
  }

  getConnectionStatus() {
    return this.isConnected ? 'connected' : 'disconnected';
  }
}

// Create singleton instance
export const websocketClient = new WebSocketClient();
export default websocketClient;