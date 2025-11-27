import Link from 'next/link';
import { Auction } from '@/lib/types';
import StatusBadge from './StatusBadge';
import { formatDistance } from 'date-fns';

interface AuctionCardProps {
  auction: Auction;
}

export default function AuctionCard({ auction }: AuctionCardProps) {
  const timeLeft = formatDistance(new Date(auction.end_time), new Date(), { addSuffix: true });
  const item = auction.auction_items?.[0];
  const room = auction.auction_rooms?.[0];

  return (
    <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-white">
      <Link href={`/auctions/${auction.id}`} className="cursor-pointer block">
        {/* Image */}
        {item?.image_urls?.[0] && (
          <img
            src={item.image_urls[0]}
            alt={auction.title}
            className="w-full h-48 object-cover rounded-md mb-4"
          />
        )}

        {/* Title & Status */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold">{auction.title}</h3>
          <StatusBadge status={auction.status} />
        </div>

        {/* Room Code */}
        <div className="mb-2">
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-mono">
            Room: {auction.room_code}
          </span>
          {room && room.participant_count > 0 && (
            <span className="ml-2 text-xs text-gray-500">
              {room.participant_count} participants
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-2">{auction.description}</p>

        {/* Details */}
        <div className="flex justify-between items-center text-sm">
          <div>
            <p className="text-gray-500">Current Bid</p>
            <p className="text-2xl font-bold text-green-600">
              Nu {auction.current_highest_bid.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-500">Ends</p>
            <p className="font-medium">{timeLeft}</p>
          </div>
        </div>

        {/* Item Type */}
        {item && (
          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {item.item_type}
            </span>
            <span className="text-xs text-gray-500">{item.location}</span>
          </div>
        )}
      </Link>

      {/* Join Bidding Button */}
      {auction.status === 'ACTIVE' && (
        <a
          href={`http://localhost:4003/auction/${auction.room_code}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-semibold block text-center transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Join Live Bidding →
        </a>
      )}
    </div>
  );
}
