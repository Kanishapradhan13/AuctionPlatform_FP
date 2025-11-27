'use client';

import { useEffect, useState } from 'react';
import { auctionAPI } from '@/lib/api';
import { AuctionRoom } from '@/lib/types';
import Link from 'next/link';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveRooms();
  }, []);

  const fetchActiveRooms = async () => {
    try {
      setLoading(true);
      const data = await auctionAPI.getActiveRooms();
      setRooms(data);
    } catch (error) {
      console.error('Failed to fetch active rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Active Auction Rooms</h1>
        <p className="text-gray-600">
          Join live auction rooms to participate in bidding
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading auction rooms...</p>
        </div>
      ) : rooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">
                  {room.auctions?.title || 'Auction Room'}
                </h3>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  LIVE
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Room Code:</span>
                  <span className="font-mono font-semibold">{room.room_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Participants:</span>
                  <span className="font-semibold">{room.participant_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Current Bid:</span>
                  <span className="font-semibold text-green-600">
                    Nu {room.auctions?.current_highest_bid?.toLocaleString() || 0}
                  </span>
                </div>
              </div>

              <a
                href={`http://localhost:4003/auction/${room.room_code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 block text-center"
              >
                Join Bidding Room
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No active auction rooms</p>
          <p className="text-gray-400 text-sm mt-2">
            Check back later for live auctions
          </p>
        </div>
      )}
    </div>
  );
}
