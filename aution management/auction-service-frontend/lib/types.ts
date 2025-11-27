export interface Auction {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  reserve_price: number;
  current_highest_bid: number;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'CANCELLED';
  winner_id?: string;
  room_code: string;
  created_at: string;
  updated_at: string;
  auction_items?: AuctionItem[];
  auction_rooms?: AuctionRoom[];
}

export interface AuctionItem {
  id: string;
  auction_id: string;
  item_type: 'LAND' | 'VEHICLE';
  condition: string;
  location: string;
  specifications: LandSpecs | VehicleSpecs;
  image_urls: string[];
  created_at: string;
}

export interface AuctionRoom {
  id: string;
  auction_id: string;
  room_code: string;
  active: boolean;
  participant_count: number;
  created_at: string;
  updated_at: string;
}

export interface LandSpecs {
  land_size: string;
  land_type: string;
  coordinates?: string;
  ownership_doc?: string;
}

export interface VehicleSpecs {
  make: string;
  model: string;
  year: number;
  mileage: number;
  engine_type: string;
  registration_number: string;
}

export interface CreateAuctionRequest {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  reserve_price: number;
  item?: {
    item_type: 'LAND' | 'VEHICLE';
    condition: string;
    location: string;
    specifications: LandSpecs | VehicleSpecs;
    image_urls: string[];
  };
}
