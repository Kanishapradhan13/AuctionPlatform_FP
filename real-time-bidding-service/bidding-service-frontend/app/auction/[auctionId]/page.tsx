'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import axios from 'axios'
import { Clock, User, AlertCircle, CheckCircle } from 'lucide-react'

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

interface AuctionInfo {
  auction_id: string
  title: string
  description: string
  item_type: string
  starting_bid: number
  end_time: string
}

// Generate or retrieve persistent user ID
const getUserId = () => {
  if (typeof window === 'undefined') return ''
  
  let userId = localStorage.getItem('bidder_user_id')
  if (!userId) {
    userId = 'bidder-' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('bidder_user_id', userId)
  }
  return userId
}

export default function AuctionRoom() {
  const params = useParams()
  const auctionId = params?.auctionId as string

  const [auctionInfo, setAuctionInfo] = useState<AuctionInfo | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [stats, setStats] = useState<AuctionStats | null>(null)
  const [bidAmount, setBidAmount] = useState('')
  const [currentHighest, setCurrentHighest] = useState(0)
  const [loading, setLoading] = useState(true)
  const [bidding, setBidding] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [userId] = useState(getUserId())
  const [timeLeft, setTimeLeft] = useState('Loading...')
  const [realtimeStatus, setRealtimeStatus] = useState<string>('connecting')
  
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (!auctionId) return

    // Load initial data
    loadAuctionData()

    // Setup realtime subscription
    setupRealtimeChannel()

    return () => {
      // Cleanup
      if (channelRef.current) {
        console.log('Cleaning up realtime channel')
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [auctionId])

  useEffect(() => {
    if (!auctionInfo) return

    const updateTimer = () => {
      const remaining = new Date(auctionInfo.end_time).getTime() - Date.now()
      if (remaining <= 0) {
        setTimeLeft('Ended')
      } else {
        const hours = Math.floor(remaining / 3600000)
        const minutes = Math.floor((remaining % 3600000) / 60000)
        const seconds = Math.floor((remaining % 60000) / 1000)
        setTimeLeft(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      }
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)
    
    return () => clearInterval(timer)
  }, [auctionInfo])

  const loadAuctionData = async () => {
    try {
      // Load auction details first
      const auctionRes = await axios.get(`${API_URL}/api/bids/auctions/${auctionId}`)
      const auctionData = auctionRes.data.data
      setAuctionInfo(auctionData)
      
      // Load bid history
      const historyRes = await axios.get(`${API_URL}/api/bids/history/${auctionId}`)
      if (historyRes.data.success && historyRes.data.data.length > 0) {
        setBids(historyRes.data.data)
        setCurrentHighest(Math.max(...historyRes.data.data.map((b: Bid) => b.amount)))
      } else {
        // No bids yet - use starting bid
        setCurrentHighest(auctionData.starting_bid)
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
      console.log('Setting up realtime channel for auction:', auctionId)
      console.log('Your User ID:', userId)

      // Subscribe to realtime updates
      const channel = supabase
        .channel(`auction-${auctionId}`, {
          config: {
            broadcast: { self: true },
            presence: { key: userId }
          }
        })
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'bids',
            filter: `auction_id=eq.${auctionId}`,
          },
          (payload) => {
            console.log('🔥 NEW BID RECEIVED:', payload.new)
            const newBid = payload.new as Bid
            
            // Update bids list
            setBids((prev) => {
              // Check if bid already exists
              if (prev.some(b => b.bid_id === newBid.bid_id)) {
                return prev
              }
              return [newBid, ...prev]
            })
            
            // Update current highest
            setCurrentHighest(newBid.amount)
            
            // Update stats
            setStats((prev) => {
              if (!prev) {
                return {
                  total_bids: 1,
                  unique_bidders: 1,
                  highest_bid: newBid.amount,
                  average_bid: newBid.amount
                }
              }
              
              const newTotalBids = prev.total_bids + 1
              const newAverage = ((prev.average_bid * prev.total_bids) + newBid.amount) / newTotalBids
              
              return {
                ...prev,
                total_bids: newTotalBids,
                highest_bid: newBid.amount,
                average_bid: newAverage
              }
            })

            // Show notification if not own bid
            if (newBid.bidder_id !== userId) {
              setMessage({
                type: 'error',
                text: 'You have been outbid!'
              })
              setTimeout(() => setMessage(null), 3000)
            }
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status)
          setRealtimeStatus(status)
        })

      channelRef.current = channel

      console.log('✅ Realtime channel setup complete')
    } catch (error) {
      console.error('❌ Error setting up realtime:', error)
      setRealtimeStatus('error')
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
      console.log('Placing bid with userId:', userId)
      
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
        
        // Bid will be added via realtime subscription automatically
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
          {auctionInfo?.title || 'Live Auction Room'}
        </h1>
        <div className="flex items-center gap-4">
          <p className="text-gray-600">
            {auctionInfo?.description || `Auction ID: ${auctionId}`}
          </p>
          {/* Realtime Status Indicator */}
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${
              realtimeStatus === 'joined' ? 'bg-green-500 animate-pulse' :
              realtimeStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
              'bg-red-500'
            }`}></div>
            <span className="text-gray-500">
              {realtimeStatus === 'joined' ? 'Connected' :
               realtimeStatus === 'connecting' ? 'Connecting...' :
               'Disconnected'}
            </span>
          </div>
          {/* User ID Display (for debugging) */}
          <span className="text-xs text-gray-400">ID: {userId.slice(0, 12)}...</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Bidding Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Bid Display */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-2">
              {bids.length === 0 ? 'Starting Bid' : 'Current Highest Bid'}
            </p>
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
                    className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                      index === 0 
                        ? 'bg-primary-50 border border-primary-200' 
                        : 'bg-gray-50'
                    } ${bid.bidder_id === userId ? 'border-l-4 border-l-blue-500' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          Nu. {bid.amount.toLocaleString()}
                          {bid.bidder_id === userId && (
                            <span className="ml-2 text-xs text-blue-600">(You)</span>
                          )}
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
              <li>• Your bids are marked with (You)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}