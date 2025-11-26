'use client'

import { useState, useEffect } from 'react'

interface Notification {
  id: string
  event_type: string
  user_email: string
  user_id: string | null
  auction_id: string | null
  auction_title: string
  additional_data: any
  status: string
  created_at: string
  sent_at: string | null
  error_message: string | null
}

export default function NotificationDashboard() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setRefreshing(true)
      setError(null)
      
      console.log('🔄 Fetching notifications from backend...')
      
      // Use direct backend URL - this is the key fix!
      const response = await fetch('http://localhost:3004/api/notifications/logs')
      
      console.log('📨 Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('📊 Received data:', result)
      
      if (result.success) {
        setNotifications(result.data)
        console.log(`✅ Loaded ${result.data.length} notifications`)
      } else {
        setError(result.error || 'Failed to fetch notifications')
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error)
      setError('Cannot connect to notification service. Make sure the backend is running on port 3004.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800 border border-green-200'
      case 'failed': return 'bg-red-100 text-red-800 border border-red-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'BID_PLACED': return 'bg-blue-100 text-blue-800'
      case 'OUTBID': return 'bg-orange-100 text-orange-800'
      case 'AUCTION_WON': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const sendTestNotification = async () => {
    try {
      console.log('📧 Sending test notification...')
      const response = await fetch('http://localhost:3004/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'BID_PLACED',
          userEmail: 'admin-test@example.com',
          userId: 'admin-user-123',
          auctionId: 'test-auction-' + Date.now(),
          auctionTitle: 'Test Property ' + new Date().toLocaleTimeString(),
          additionalData: { bidAmount: Math.floor(Math.random() * 100000) + 50000 }
        })
      })

      const result = await response.json()
      console.log('📧 Send result:', result)
      
      if (result.success) {
        // Refresh the list after a short delay
        setTimeout(fetchNotifications, 1000)
        alert('✅ Test notification sent successfully!')
      } else {
        alert('❌ Failed to send test notification: ' + result.message)
      }
    } catch (error) {
      console.error('❌ Error sending test notification:', error)
      alert('❌ Error sending test notification: Make sure backend is running on port 3004')
    }
  }

  // Calculate stats from notifications
  const stats = {
    total: notifications.length,
    sent: notifications.filter(n => n.status === 'sent').length,
    pending: notifications.filter(n => n.status === 'pending').length,
    failed: notifications.filter(n => n.status === 'failed').length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-700">Loading notifications...</div>
          <div className="text-sm text-gray-500 mt-2">Connecting to backend service</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📧 Notification Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Real-time monitoring of auction notifications
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Backend: http://localhost:3004
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-gray-600">Total Notifications</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
            <div className="text-gray-600">Sent</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-gray-600">Failed</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex justify-between items-center">
              <div>
                <strong>Error: </strong>{error}
              </div>
              <button 
                onClick={fetchNotifications}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Notifications Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">
                Notification Logs ({stats.total} total)
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={fetchNotifications}
                  disabled={refreshing}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
                </button>
                <button 
                  onClick={sendTestNotification}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  📧 Send Test
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auction Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getEventTypeColor(notification.event_type)}`}>
                        {notification.event_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{notification.user_email}</div>
                      {notification.user_id && (
                        <div className="text-xs text-gray-500">User ID: {notification.user_id}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{notification.auction_title}</div>
                      {notification.auction_id && (
                        <div className="text-xs text-gray-500">Auction ID: {notification.auction_id}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(notification.status)}`}>
                        {notification.status.toUpperCase()}
                      </span>
                      {notification.error_message && (
                        <div className="text-xs text-red-600 mt-1 max-w-xs">
                          Error: {notification.error_message}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(notification.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {notification.sent_at ? formatDate(notification.sent_at) : 'Not sent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {notifications.length === 0 && !error && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg">No notifications found</div>
                <div className="text-gray-400 text-sm mt-2">Send a test notification to see it here!</div>
              </div>
            )}
          </div>
        </div>

        {/* Connection Status */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">
            Backend Connection Status: {error ? '❌ Disconnected' : '✅ Connected'}
          </h3>
          <div className="text-sm text-blue-700">
            <div>Backend URL: http://localhost:3004</div>
            <div>Notifications loaded: {notifications.length}</div>
            <div>Last updated: {new Date().toLocaleString()}</div>
            {!error && notifications.length > 0 && (
              <div className="mt-2 text-green-600">
                <strong>✅ Success!</strong> Your dashboard is connected and showing {notifications.length} notifications from the database.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}