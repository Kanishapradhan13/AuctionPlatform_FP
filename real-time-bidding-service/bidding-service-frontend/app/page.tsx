'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Activity, TrendingUp, Users, Clock } from 'lucide-react'

interface Auction {
  auction_id: string
  title: string
  current_bid: number
  total_bids: number
  end_time: string
}

export default function Home() {
  const [activeAuctions, setActiveAuctions] = useState<Auction[]>([])
  const [stats, setStats] = useState({
    activeAuctions: 0,
    totalBids: 0,
    activeBidders: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Mock data for demo - replace with actual API calls
      setActiveAuctions([
        {
          auction_id: 'test-auction',
          title: 'Land Plot in Thimphu',
          current_bid: 5000,
          total_bids: 12,
          end_time: new Date(Date.now() + 3600000).toISOString(),
        },
      ])

      setStats({
        activeAuctions: 1,
        totalBids: 12,
        activeBidders: 5,
      })

      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Real-Time Bidding Dashboard
        </h1>
        <p className="text-gray-600">
          Live auctions for land and vehicles in Bhutan
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Auctions</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.activeAuctions}
              </p>
            </div>
            <Activity className="w-12 h-12 text-primary-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Bids Today</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalBids}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Bidders</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.activeBidders}
              </p>
            </div>
            <Users className="w-12 h-12 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Active Auctions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Active Auctions
        </h2>

        {activeAuctions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No active auctions at the moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeAuctions.map((auction) => (
              <div
                key={auction.auction_id}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {auction.title}
                    </h3>
                    <p className="text-gray-600">
                      Current Bid: <span className="font-bold text-primary-600">
                        Nu. {auction.current_bid.toLocaleString()}
                      </span>
                    </p>
                  </div>
                  <Link
                    href={`/auction/${auction.auction_id}`}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    View & Bid
                  </Link>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{auction.total_bids} bids</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      Ends {new Date(auction.end_time).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/auction/test-auction"
          className="bg-primary-600 text-white rounded-lg p-6 hover:bg-primary-700 transition-colors text-center"
        >
          <h3 className="text-2xl font-bold mb-2">Join Live Auction</h3>
          <p>Participate in real-time bidding</p>
        </Link>

        <Link
          href="/history"
          className="bg-gray-800 text-white rounded-lg p-6 hover:bg-gray-900 transition-colors text-center"
        >
          <h3 className="text-2xl font-bold mb-2">View Bid History</h3>
          <p>See all past bids and statistics</p>
        </Link>
      </div>
    </div>
  )
}
