'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auctionAPI, bidAPI } from '@/lib/api';
import { Auction } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import { format, formatDistance } from 'date-fns';

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [placingBid, setPlacingBid] = useState(false);
  const [bidError, setBidError] = useState<string>('');

  useEffect(() => {
    if (params.roomCode) {
      fetchRoomDetails(params.roomCode as string);
    }
  }, [params.roomCode]);

  const fetchRoomDetails = async (roomCode: string) => {
    try {
      setLoading(true);
      const data = await auctionAPI.getByRoomCode(roomCode);
      setAuction(data);
    } catch (error) {
      console.error('Failed to fetch room details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!auction) return;

    try {
      await auctionAPI.joinRoom(auction.room_code);
      setJoined(true);
      // Refresh room details to update participant count
      fetchRoomDetails(auction.room_code);
    } catch (error) {
      console.error('Failed to join room:', error);
      alert('Failed to join room');
    }
  };

  const handlePlaceBid = async () => {
    if (!auction) return;

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setBidError('Please enter a valid bid amount');
      return;
    }

    if (amount <= auction.current_highest_bid) {
      setBidError(`Bid must be higher than Nu ${auction.current_highest_bid.toLocaleString()}`);
      return;
    }

    try {
      setPlacingBid(true);
      setBidError('');

      await bidAPI.placeBidByRoomCode(auction.room_code, amount);

      // Refresh auction details to show new bid
      await fetchRoomDetails(auction.room_code);

      // Clear bid input
      setBidAmount('');

      alert('Bid placed successfully!');
    } catch (error: any) {
      console.error('Failed to place bid:', error);
      const errorMsg = error.response?.data?.error || 'Failed to place bid';
      setBidError(errorMsg);
    } finally {
      setPlacingBid(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Loading auction room...</p>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Auction room not found</p>
          <button
            onClick={() => router.push('/rooms')}
            className="text-blue-600 hover:underline"
          >
            Back to Rooms
          </button>
        </div>
      </div>
    );
  }

  const item = auction.auction_items?.[0];
  const room = auction.auction_rooms?.[0];
  const timeLeft = formatDistance(new Date(auction.end_time), new Date(), { addSuffix: true });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Room Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-lg mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{auction.title}</h1>
            <div className="flex gap-3 items-center">
              <span className="text-2xl font-mono font-bold">
                Room: {auction.room_code}
              </span>
              <StatusBadge status={auction.status} />
            </div>
          </div>
          {!joined && auction.status === 'ACTIVE' && (
            <button
              onClick={handleJoinRoom}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
            >
              Join Room
            </button>
          )}
          {joined && (
            <span className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold">
              Joined
            </span>
          )}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-6">
          <div>
            <p className="text-blue-200 text-sm">Current Bid</p>
            <p className="text-3xl font-bold">
              Nu {auction.current_highest_bid.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-blue-200 text-sm">Participants</p>
            <p className="text-3xl font-bold">{room?.participant_count || 0}</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm">Time Remaining</p>
            <p className="text-xl font-bold">{timeLeft}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Item Image */}
          {item?.image_urls && item.image_urls.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <img
                src={item.image_urls[0]}
                alt={auction.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Description */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{auction.description}</p>
          </div>

          {/* Bidding Area */}
          {auction.status === 'ACTIVE' && joined && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Place Your Bid</h2>

              {bidError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-600 text-sm">{bidError}</p>
                </div>
              )}

              <div className="flex gap-4">
                <input
                  type="number"
                  placeholder="Enter bid amount"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={auction.current_highest_bid + 1}
                  disabled={placingBid}
                />
                <button
                  onClick={handlePlaceBid}
                  disabled={placingBid || !bidAmount}
                  className="bg-green-600 text-white px-8 py-2 rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {placingBid ? 'Placing...' : 'Place Bid'}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Minimum bid: Nu {(auction.current_highest_bid + 1).toLocaleString()}
              </p>
            </div>
          )}

          {/* Item Specifications */}
          {item && (
            <div className="bg-white p-6 rounded-lg shadow mt-6">
              <h2 className="text-xl font-semibold mb-4">
                {item.item_type === 'LAND' ? 'Land Details' : 'Vehicle Details'}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">{item.item_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Condition</p>
                  <p className="font-medium">{item.condition}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{item.location}</p>
                </div>

                {/* Type-specific fields */}
                {item.item_type === 'LAND' && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Land Size</p>
                      <p className="font-medium">{(item.specifications as any).land_size}</p>
                    </div>
                  </>
                )}
                {item.item_type === 'VEHICLE' && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Make & Model</p>
                      <p className="font-medium">
                        {(item.specifications as any).make} {(item.specifications as any).model}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Auction Info */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">Auction Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Reserve Price</p>
                <p className="text-xl font-semibold">
                  Nu {auction.reserve_price.toLocaleString()}
                </p>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-500">Start Time</p>
                <p className="font-medium">
                  {format(new Date(auction.start_time), 'PPp')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">End Time</p>
                <p className="font-medium">
                  {format(new Date(auction.end_time), 'PPp')}
                </p>
              </div>
            </div>
          </div>

          {/* Room Activity (Placeholder) */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="text-sm text-gray-500 text-center py-4">
                No recent bids yet
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
