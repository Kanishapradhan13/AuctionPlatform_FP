-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Auctions table
CREATE TABLE IF NOT EXISTS auctions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  reserve_price DECIMAL(10,2) NOT NULL,
  current_highest_bid DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'DRAFT',
  winner_id TEXT,
  room_code VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Auction items table
CREATE TABLE IF NOT EXISTS auction_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  item_type VARCHAR(20) NOT NULL,
  condition VARCHAR(50),
  location VARCHAR(255),
  specifications JSONB,
  image_urls TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Auction rooms table for real-time bidding
CREATE TABLE IF NOT EXISTS auction_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  room_code VARCHAR(50) UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true,
  participant_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_auctions_seller ON auctions(seller_id);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_created ON auctions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auctions_room_code ON auctions(room_code);
CREATE INDEX IF NOT EXISTS idx_items_auction ON auction_items(auction_id);
CREATE INDEX IF NOT EXISTS idx_rooms_auction ON auction_rooms(auction_id);
CREATE INDEX IF NOT EXISTS idx_rooms_code ON auction_rooms(room_code);

-- Comments for documentation
COMMENT ON TABLE auctions IS 'Main auction table storing auction details';
COMMENT ON TABLE auction_items IS 'Stores item-specific details for each auction';
COMMENT ON TABLE auction_rooms IS 'Manages virtual auction rooms for real-time bidding';
COMMENT ON COLUMN auctions.room_code IS 'Unique code for accessing the auction room';
COMMENT ON COLUMN auctions.status IS 'Auction status: DRAFT, ACTIVE, CLOSED, CANCELLED';
COMMENT ON COLUMN auction_items.specifications IS 'JSONB field for flexible land/vehicle specifications';
