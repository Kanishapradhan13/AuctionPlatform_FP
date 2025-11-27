'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Activity, TrendingUp, Users, Clock } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

interface AuctionData {
  id: string
  title: string
  description: string
  item_type: string
  current_bid: number
  starting_bid: number
  total_bids: number
  unique_bidders: number
  end_time: string
}

export default function Dashboard() {
  const [auctions, setAuctions] = useState<AuctionData[]>([])
  const [loading, setLoading] = useState(true)
  const [totalBids, setTotalBids] = useState(0)
  const [totalBidders, setTotalBidders] = useState(0)

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
      // Get all active auctions
      const auctionsRes = await axios.get(`${API_URL}/api/bids/auctions`)
      const auctionsList = auctionsRes.data.data || []
      
      // Get data for each auction
      const auctionDataPromises = auctionsList.map(async (auction: any) => {
        try {
          const highestRes = await axios.get(`${API_URL}/api/bids/highest/${auction.auction_id}`)
          const statsRes = await axios.get(`${API_URL}/api/bids/statistics/${auction.auction_id}`)
          
          // Use highest bid if exists, otherwise show starting bid
          const currentBid = highestRes.data.data?.amount || auction.starting_bid
          
          return {
            id: auction.auction_id,
            title: auction.title,
            description: auction.description,
            item_type: auction.item_type,
            current_bid: currentBid,
            starting_bid: auction.starting_bid,
            total_bids: statsRes.data.data?.total_bids || 0,
            unique_bidders: statsRes.data.data?.unique_bidders || 0,
            end_time: auction.end_time
          }
        } catch (error) {
          // If no bids yet, use starting bid
          return {
            id: auction.auction_id,
            title: auction.title,
            description: auction.description,
            item_type: auction.item_type,
            current_bid: auction.starting_bid,
            starting_bid: auction.starting_bid,
            total_bids: 0,
            unique_bidders: 0,
            end_time: auction.end_time
          }
        }
      })
      
      const auctionData = await Promise.all(auctionDataPromises)
      setAuctions(auctionData)
      
      // Calculate totals
      const totalBidsCount = auctionData.reduce((sum, a) => sum + a.total_bids, 0)
      
      setTotalBids(totalBidsCount)
      setTotalBidders(auctionData.reduce((sum, a) => sum + a.unique_bidders, 0))
      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setLoading(false)
    }
  }

  const getTimeRemaining = (endTime: string) => {
    const remaining = new Date(endTime).getTime() - Date.now()
    if (remaining <= 0) return 'Ended'
    
    const hours = Math.floor(remaining / 3600000)
    const minutes = Math.floor((remaining % 3600000) / 60000)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
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
              <p className="text-3xl font-bold text-gray-900">{auctions.length}</p>
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
              <p className="text-3xl font-bold text-gray-900">{totalBids}</p>
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
              <p className="text-3xl font-bold text-gray-900">{totalBidders}</p>
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
        
        {auctions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No active auctions at the moment</p>
        ) : (
          <div className="space-y-4">
            {auctions.map((auction) => (
              <div 
                key={auction.id}
                className="border border-primary-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {auction.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        auction.item_type === 'land' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {auction.item_type === 'land' ? 'Land' : 'Vehicle'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{auction.description}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>
                          {auction.total_bids === 0 ? (
                            <>Starting Bid: <span className="font-semibold text-gray-700">Nu. {auction.starting_bid.toLocaleString()}</span></>
                          ) : (
                            <>Current Bid: <span className="font-semibold text-primary-600">Nu. {auction.current_bid.toLocaleString()}</span></>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        <span>{auction.total_bids} bids</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Ends in {getTimeRemaining(auction.end_time)}</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/auction/${auction.id}`}
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    View & Bid
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href={auctions.length > 0 ? `/auction/${auctions[0].id}` : '#'}
          className={`rounded-lg p-8 transition-colors text-center ${
            auctions.length > 0
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <h3 className="text-2xl font-bold mb-2">Join Live Auction</h3>
          <p className={auctions.length > 0 ? 'text-primary-100' : 'text-gray-600'}>
            Participate in real-time bidding
          </p>
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