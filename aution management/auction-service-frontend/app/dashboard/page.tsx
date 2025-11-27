'use client';

import { useEffect, useState } from 'react';
import { auctionAPI } from '@/lib/api';
import { Auction } from '@/lib/types';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';

export default function DashboardPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'draft' | 'active' | 'closed'>('all');

  useEffect(() => {
    fetchMyAuctions();
  }, [tab]);

  const fetchMyAuctions = async () => {
    try {
      setLoading(true);
      const userId = process.env.NEXT_PUBLIC_USER_ID;
      const filters: any = { seller_id: userId };

      if (tab !== 'all') {
        filters.status = tab.toUpperCase();
      }

      const data = await auctionAPI.getAll(filters);
      setAuctions(data);
    } catch (error) {
      console.error('Failed to fetch auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: auctions.length,
    draft: auctions.filter(a => a.status === 'DRAFT').length,
    active: auctions.filter(a => a.status === 'ACTIVE').length,
    closed: auctions.filter(a => a.status === 'CLOSED').length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Auction Rooms</h1>
          <p className="text-gray-600 mt-2">
            Manage your auctions and their dedicated rooms
          </p>
        </div>
        <Link
          href="/auctions/create"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Create New Auction
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Total Auctions</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Draft</p>
          <p className="text-3xl font-bold text-gray-600">{stats.draft}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Active</p>
          <p className="text-3xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Closed</p>
          <p className="text-3xl font-bold text-blue-600">{stats.closed}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {(['all', 'draft', 'active', 'closed'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg font-medium ${
              tab === t
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Auctions Table */}
      {loading ? (
        <p className="text-center py-12">Loading...</p>
      ) : auctions.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Room Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Current Bid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {auctions.map((auction) => (
                <tr key={auction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/auctions/${auction.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {auction.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {auction.room_code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={auction.status} />
                  </td>
                  <td className="px-6 py-4">
                    Nu {auction.current_highest_bid.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {auction.auction_rooms?.[0]?.participant_count || 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/auctions/${auction.id}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View
                      </Link>
                      {auction.status === 'ACTIVE' && (
                        <Link
                          href={`/rooms/${auction.room_code}`}
                          className="text-green-600 hover:underline text-sm"
                        >
                          Room
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">No auctions found</p>
          <Link
            href="/auctions/create"
            className="text-blue-600 hover:underline"
          >
            Create your first auction
          </Link>
        </div>
      )}
    </div>
  );
}
