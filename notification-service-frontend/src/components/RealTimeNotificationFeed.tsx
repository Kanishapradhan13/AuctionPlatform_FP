'use client';
import { useState, useEffect } from 'react';
import { websocketClient } from '../lib/websocket';

interface Notification {
  id: string;
  eventType: string;
  auctionTitle: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface RealTimeNotificationFeedProps {
  userId?: string;
}

export default function RealTimeNotificationFeed({ userId = 'user123' }: RealTimeNotificationFeedProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');

  useEffect(() => {
    // Connect to WebSocket
    websocketClient.connect(userId);

    // Handle incoming messages
    const unsubscribe = websocketClient.onMessage((message) => {
      console.log('📨 Received WebSocket message:', message);
      
      switch (message.type) {
        case 'CONNECTED':
          setConnectionStatus('connected');
          break;
        
        case 'DISCONNECTED':
          setConnectionStatus('disconnected');
          break;
        
        case 'NEW_NOTIFICATION':
          setNotifications(prev => [message.data, ...prev.slice(0, 49)]); // Keep last 50
          break;
        
        default:
          console.log('Unknown message type:', message.type);
      }
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
      websocketClient.disconnect();
    };
  }, [userId]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getNotificationIcon = (eventType: string) => {
    switch (eventType) {
      case 'BID_PLACED': return '✅';
      case 'OUTBID': return '🚨';
      case 'AUCTION_WON': return '🎉';
      case 'NEW_BID': return '💰';
      default: return '📢';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Real-time Notifications</h2>
          <p className="text-gray-600">Live updates from Bhutan Auction Platform</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
            <span className="text-sm font-medium capitalize">{connectionStatus}</span>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Connection Info */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <span>📡</span>
          <div>
            <p className="font-medium">Real-time connection active</p>
            <p className="text-blue-700">User ID: {userId} | Backend: ws://localhost:3004/ws</p>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🔔</div>
            <p className="text-gray-500">No notifications yet</p>
            <p className="text-sm text-gray-400">Notifications will appear here in real-time</p>
          </div>
        ) : (
          notifications.map((notification, index) => (
            <div
              key={`${notification.id}-${index}`}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.01]"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-1">{getNotificationIcon(notification.eventType)}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-gray-800">{notification.message}</p>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {formatTime(notification.timestamp)}
                    </span>
                  </div>
                  {notification.auctionTitle && (
                    <p className="text-sm text-gray-600 mt-1">
                      Auction: <span className="font-medium">{notification.auctionTitle}</span>
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded capitalize">
                      {notification.eventType.toLowerCase().replace('_', ' ')}
                    </span>
                    {!notification.read && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                        New
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Total notifications: {notifications.length}</span>
          <span>Last update: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}