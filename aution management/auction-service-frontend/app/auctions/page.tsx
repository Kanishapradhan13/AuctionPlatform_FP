'use client';

import { useEffect, useState } from 'react';
import { auctionAPI } from '@/lib/api';
import { Auction } from '@/lib/types';
import AuctionCard from '@/components/AuctionCard';
import Link from 'next/link';

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    fetchAuctions();
  }, [filter]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const data = await auctionAPI.getAll({ status: filter || undefined });
      setAuctions(data);
    } catch (error) {
      console.error('Failed to fetch auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      fetchAuctions();
      return;
    }

    try {
      setLoading(true);
      const data = await auctionAPI.search(search);
      setAuctions(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Browse Auctions</h1>
          <p className="text-gray-600 mt-2">
            Explore auction rooms for land and vehicles
          </p>
        </div>
        <Link
          href="/auctions/create"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Create Auction
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 flex gap-4">
        {/* Search */}
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Search auctions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300"
          >
            Search
          </button>
        </div>

        {/* Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading auctions...</p>
        </div>
      )}

      {/* Auction Grid */}
      {!loading && auctions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && auctions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No auctions found</p>
          <Link
            href="/auctions/create"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Create your first auction
          </Link>
        </div>
      )}
    </div>
  );
}
