'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auctionAPI } from '@/lib/api';
import { Auction } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import { format } from 'date-fns';

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchAuction(params.id as string);
    }
  }, [params.id]);

  const fetchAuction = async (id: string) => {
    try {
      setLoading(true);
      const data = await auctionAPI.getById(id);
      setAuction(data);
    } catch (error) {
      console.error('Failed to fetch auction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!auction) return;

    try {
      await auctionAPI.updateStatus(auction.id, newStatus);
      fetchAuction(auction.id);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!auction) return;

    if (!confirm('Are you sure you want to cancel this auction?')) return;

    try {
      await auctionAPI.delete(auction.id);
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to delete auction:', error);
      alert('Failed to cancel auction');
    }
  };

  const handleJoinRoom = () => {
    if (!auction) return;
    // Open Real-Time Bidding service in new tab
    window.open(`http://localhost:4003/auction/${auction.room_code}`, '_blank');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Auction not found</p>
      </div>
    );
  }

  const item = auction.auction_items?.[0];
  const room = auction.auction_rooms?.[0];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{auction.title}</h1>
          <div className="flex gap-2 items-center">
            <StatusBadge status={auction.status} />
            <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded font-mono">
              Room: {auction.room_code}
            </span>
          </div>
        </div>

        {/* Actions (if owner) */}
        <div className="flex gap-2">
          {auction.status === 'ACTIVE' && (
            <button
              onClick={handleJoinRoom}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Join Room
            </button>
          )}
          {auction.status === 'DRAFT' && (
            <>
              <button
                onClick={() => handleStatusChange('ACTIVE')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Publish
              </button>
            </>
          )}
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Images */}
          {item?.image_urls && item.image_urls.length > 0 && (
            <div className="mb-6">
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

          {/* Item Specifications */}
          {item && (
            <div className="bg-white p-6 rounded-lg shadow">
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

                {/* Land Specific */}
                {item.item_type === 'LAND' && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Land Size</p>
                      <p className="font-medium">{(item.specifications as any).land_size}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Land Type</p>
                      <p className="font-medium">{(item.specifications as any).land_type}</p>
                    </div>
                  </>
                )}

                {/* Vehicle Specific */}
                {item.item_type === 'VEHICLE' && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Make & Model</p>
                      <p className="font-medium">
                        {(item.specifications as any).make} {(item.specifications as any).model}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Year</p>
                      <p className="font-medium">{(item.specifications as any).year}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mileage</p>
                      <p className="font-medium">{(item.specifications as any).mileage?.toLocaleString()} km</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Registration</p>
                      <p className="font-medium">{(item.specifications as any).registration_number}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Bidding Info */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">Auction Information</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Current Highest Bid</p>
                <p className="text-3xl font-bold text-green-600">
                  Nu {auction.current_highest_bid.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Reserve Price</p>
                <p className="text-xl font-semibold">
                  Nu {auction.reserve_price.toLocaleString()}
                </p>
              </div>

              <div className="pt-4 border-t">
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

          {/* Room Info */}
          {room && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-lg font-semibold mb-4">Room Information</h2>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Room Code</p>
                  <p className="font-mono text-lg font-bold">{auction.room_code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Participants</p>
                  <p className="font-medium">{room.participant_count}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{room.active ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Seller Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Seller Information</h2>
            <p className="text-sm text-gray-500">Seller ID</p>
            <p className="font-medium">{auction.seller_id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
