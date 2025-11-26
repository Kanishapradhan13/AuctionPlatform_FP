'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { TrendingUp, Clock, Search, Filter } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

interface Bid {
  bid_id: string
  auction_id: string
  bidder_id: string
  amount: number
  bid_time: string
  is_winning: boolean
}

export default function BidHistory() {
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAuction, setFilterAuction] = useState<string>('')

  useEffect(() => {
    fetchAllBids()
  }, [])

  const fetchAllBids = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/bids/recent`, {
        params: { limit: 50 }
      })

      if (response.data.success) {
        setBids(response.data.data)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching bids:', error)
      setLoading(false)
    }
  }

  const filteredBids = bids.filter((bid) => {
    const matchesSearch = 
      bid.auction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bid.bidder_id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = !filterAuction || bid.auction_id === filterAuction

    return matchesSearch && matchesFilter
  })

  const uniqueAuctions = [...new Set(bids.map(b => b.auction_id))]

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
          Bid History
        </h1>
        <p className="text-gray-600">
          View all bids across all auctions
        </p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by auction or bidder ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterAuction}
              onChange={(e) => setFilterAuction(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Auctions</option>
              {uniqueAuctions.map((auctionId) => (
                <option key={auctionId} value={auctionId}>
                  {auctionId}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bid Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bidder
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBids.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No bids found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredBids.map((bid) => (
                  <tr key={bid.bid_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bid.auction_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {bid.bidder_id.substring(0, 20)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary-600">
                      Nu. {bid.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(bid.bid_time).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {bid.is_winning ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Winning
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Outbid
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm mb-1">Total Bids</p>
          <p className="text-3xl font-bold text-gray-900">{bids.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm mb-1">Active Auctions</p>
          <p className="text-3xl font-bold text-gray-900">{uniqueAuctions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm mb-1">Highest Bid</p>
          <p className="text-3xl font-bold text-gray-900">
            Nu. {Math.max(...bids.map(b => b.amount), 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}
