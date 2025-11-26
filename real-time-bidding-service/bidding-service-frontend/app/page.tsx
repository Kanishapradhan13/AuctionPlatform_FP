'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Activity, TrendingUp, Users } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

interface AuctionData {
  id: string
  title: string
  current_bid: number
  total_bids: number
  unique_bidders: number
}

export default function Dashboard() {
  const [auctionData, setAuctionData] = useState<AuctionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      loadDashboardData()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      const auctionId = 'test-auction'
      
      // Get highest bid
      const highestRes = await axios.get(`${API_URL}/api/bids/highest/${auctionId}`)
      
      // Get statistics
      const statsRes = await axios.get(`${API_URL}/api/bids/statistics/${auctionId}`)
      
      const currentBid = highestRes.data.data?.amount || 0
      const stats = statsRes.data.data || { total_bids: 0, unique_bidders: 0 }

      setAuctionData({
        id: auctionId,
        title: 'Land Plot in Thimphu',
        current_bid: currentBid,
        total_bids: stats.total_bids,
        unique_bidders: stats.unique_bidders
      })

      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setLoading(false)
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Real-Time Bidding Dashboard
        </h1>
        <p className="text-gray-600">
          Live auctions for land and vehicles in Bhutan
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Active Auctions</p>
              <p className="text-3xl font-bold text-gray-900">1</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-full">
              <Activity className="w-8 h-8 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Bids Today</p>
              <p className="text-3xl font-bold text-gray-900">{auctionData?.total_bids || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Active Bidders</p>
              <p className="text-3xl font-bold text-gray-900">{auctionData?.unique_bidders || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Auctions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Auctions</h2>
        
        {auctionData && (
          <div className="border border-primary-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {auctionData.title}
                </h3>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Current Bid: <span className="font-semibold text-primary-600">Nu. {auctionData.current_bid.toLocaleString()}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span>{auctionData.total_bids} bids</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Ends {new Date(Date.now() + 3600000).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
              <Link
                href={`/auction/${auctionData.id}`}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                View & Bid
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/auction/test-auction"
          className="bg-primary-600 text-white rounded-lg p-8 hover:bg-primary-700 transition-colors text-center"
        >
          <h3 className="text-2xl font-bold mb-2">Join Live Auction</h3>
          <p className="text-primary-100">Participate in real-time bidding</p>
        </Link>

        <Link
          href="/history"
          className="bg-gray-800 text-white rounded-lg p-8 hover:bg-gray-900 transition-colors text-center"
        >
          <h3 className="text-2xl font-bold mb-2">View Bid History</h3>
          <p className="text-gray-300">See all past bids and statistics</p>
        </Link>
      </div>
    </div>
  )
}