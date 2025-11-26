'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import axios from 'axios'
import { TrendingUp, Clock, User, AlertCircle, CheckCircle } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Bid {
  bid_id: string
  auction_id: string
  bidder_id: string
  amount: number
  bid_time: string
  is_winning: boolean
}

interface AuctionStats {
  total_bids: number
  unique_bidders: number
  highest_bid: number
  average_bid: number
}

export default function AuctionRoom() {
  const params = useParams()
  const auctionId = params?.auctionId as string

  const [bids, setBids] = useState<Bid[]>([])
  const [stats, setStats] = useState<AuctionStats | null>(null)
  const [bidAmount, setBidAmount] = useState('')
  const [currentHighest, setCurrentHighest] = useState(0)
  const [loading, setLoading] = useState(true)
  const [bidding, setBidding] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [userId] = useState('demo-user-' + Math.random().toString(36).substr(2, 9))
  const [timeLeft, setTimeLeft] = useState('1:00:00')
  
  const channelRef = useRef<any>(null)

  useEffect(() => {
    const endTime = Date.now() + 3600000 // 1 hour from now
    
    const timer = setInterval(() => {
      const remaining = endTime - Date.now()
      if (remaining <= 0) {
        setTimeLeft('Ended')
        clearInterval(timer)
      } else {
        const hours = Math.floor(remaining / 3600000)
        const minutes = Math.floor((remaining % 3600000) / 60000)
        const seconds = Math.floor((remaining % 60000) / 1000)
        setTimeLeft(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!auctionId) return

    // Load initial data
    loadAuctionData()

    // Setup realtime subscription
    setupRealtimeChannel()

    return () => {
      // Cleanup
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [auctionId])

  const loadAuctionData = async () => {
    try {
      // Load bid history
      const historyRes = await axios.get(`${API_URL}/api/bids/history/${auctionId}`)
      if (historyRes.data.success) {
        setBids(historyRes.data.data)
        if (historyRes.data.data.length > 0) {
          setCurrentHighest(Math.max(...historyRes.data.data.map((b: Bid) => b.amount)))
        }
      }

      // Load statistics
      const statsRes = await axios.get(`${API_URL}/api/bids/statistics/${auctionId}`)
      if (statsRes.data.success) {
        setStats(statsRes.data.data)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading auction data:', error)
      setLoading(false)
    }
  }

  const setupRealtimeChannel = async () => {
    try {
      // Setup realtime channel on backend
      await axios.post(`${API_URL}/api/bids/realtime/setup/${auctionId}`)

      // Subscribe to realtime updates
      const channel = supabase
        .channel(`auction:${auctionId}:bids`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'bids',
            filter: `auction_id=eq.${auctionId}`,
          },
          (payload) => {
            console.log('New bid received:', payload.new)
            const newBid = payload.new as Bid
            
            setBids((prev) => [newBid, ...prev])
            setCurrentHighest(newBid.amount)
            
            // Update stats
            setStats((prev) => prev ? {
              ...prev,
              total_bids: prev.total_bids + 1,
              highest_bid: newBid.amount,
            } : null)
          }
        )
        .subscribe()

      channelRef.current = channel
    } catch (error) {
      console.error('Error setting up realtime:', error)
    }
  }

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const amount = parseFloat(bidAmount)
    if (isNaN(amount) || amount <= currentHighest) {
      setMessage({
        type: 'error',
        text: `Bid must be higher than Nu. ${currentHighest.toLocaleString()}`
      })
      return
    }

    setBidding(true)
    setMessage(null)

    try {
      const response = await axios.post(`${API_URL}/api/bids/place`, {
        auction_id: auctionId,
        bidder_id: userId,
        amount: amount,
      })

      if (response.data.success) {
        setMessage({
          type: 'success',
          text: 'Bid placed successfully!'
        })
        setBidAmount('')
        
        // Bid will be added via realtime subscription
      } else {
        setMessage({
          type: 'error',
          text: response.data.message || 'Failed to place bid'
        })
      }
    } catch (error: any) {
      console.error('Error placing bid:', error)
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to place bid'
      })
    } finally {
      setBidding(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Live Auction Room
        </h1>
        <p className="text-gray-600">
          Auction ID: {auctionId}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Bidding Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Bid Display */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-2">Current Highest Bid</p>
            <p className="text-5xl font-bold text-primary-600 mb-6">
              Nu. {currentHighest.toLocaleString()}
            </p>
            
            {/* Bid Form */}
            <form onSubmit={handlePlaceBid} className="max-w-md mx-auto">
              <div className="flex gap-4">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Minimum: ${(currentHighest + 100).toLocaleString()}`}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={bidding}
                  step="100"
                  min={currentHighest + 100}
                />
                <button
                  type="submit"
                  disabled={bidding}
                  className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-400"
                >
                  {bidding ? 'Placing...' : 'Place Bid'}
                </button>
              </div>
            </form>

            {/* Messages */}
            {message && (
              <div className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800' 
                  : 'bg-red-50 text-red-800'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span>{message.text}</span>
              </div>
            )}
          </div>

          {/* Bid History */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Bid History
            </h2>
            
            {bids.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No bids yet. Be the first to bid!
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {bids.map((bid, index) => (
                  <div
                    key={bid.bid_id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      index === 0 
                        ? 'bg-primary-50 border border-primary-200 animate-bid-success' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          Nu. {bid.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(bid.bid_time).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    {index === 0 && (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Highest
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Statistics Sidebar */}
        <div className="space-y-6">
          {/* Live Indicator */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Auction Status
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-bid-pulse"></div>
                <span className="text-green-600 font-semibold">LIVE</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <span>Ends in {timeLeft}</span>
            </div>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Auction Statistics
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm">Total Bids</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total_bids}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Unique Bidders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.unique_bidders}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Average Bid</p>
                  <p className="text-2xl font-bold text-gray-900">
                    Nu. {Math.round(stats.average_bid).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bid Increments Guide */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Bidding Guidelines
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Minimum increment: Nu. 100</li>
              <li>• Bid must be higher than current highest</li>
              <li>• Real-time updates for all bidders</li>
              <li>• Cannot outbid yourself</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}