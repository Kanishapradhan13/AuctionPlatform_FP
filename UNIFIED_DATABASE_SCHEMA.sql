-- ============================================
-- UNIFIED DATABASE SCHEMA
-- For Bhutan Online Auction Platform
-- Combines Auction Management + Real-Time Bidding
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- AUCTION MANAGEMENT TABLES
-- ============================================

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

-- ============================================
-- REAL-TIME BIDDING TABLES
-- ============================================

-- Bids table (uses room_code as auction identifier)
CREATE TABLE IF NOT EXISTS bids (
  bid_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id TEXT NOT NULL,  -- This will store the room_code
  bidder_id TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  bid_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_winning BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bid history table for audit trail
CREATE TABLE IF NOT EXISTS bid_history (
  history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bid_id UUID REFERENCES bids(bid_id) ON DELETE CASCADE,
  auction_id TEXT NOT NULL,  -- This will store the room_code
  bidder_id TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  bid_time TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'placed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Auction Management indexes
CREATE INDEX IF NOT EXISTS idx_auctions_seller ON auctions(seller_id);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_created ON auctions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auctions_room_code ON auctions(room_code);
CREATE INDEX IF NOT EXISTS idx_items_auction ON auction_items(auction_id);
CREATE INDEX IF NOT EXISTS idx_rooms_auction ON auction_rooms(auction_id);
CREATE INDEX IF NOT EXISTS idx_rooms_code ON auction_rooms(room_code);

-- Real-Time Bidding indexes
CREATE INDEX IF NOT EXISTS idx_bids_auction ON bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder ON bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_bids_time ON bids(bid_time DESC);
CREATE INDEX IF NOT EXISTS idx_history_auction ON bid_history(auction_id);
CREATE INDEX IF NOT EXISTS idx_history_bidder ON bid_history(bidder_id);

-- ============================================
-- ENABLE REALTIME FOR BIDS
-- ============================================

-- Enable Realtime for the bids table so bidding updates are live
ALTER PUBLICATION supabase_realtime ADD TABLE bids;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE auctions IS 'Main auction table storing auction details';
COMMENT ON TABLE auction_items IS 'Stores item-specific details for each auction (land/vehicle)';
COMMENT ON TABLE auction_rooms IS 'Manages virtual auction rooms for real-time bidding';
COMMENT ON TABLE bids IS 'Stores all bids placed on auctions (auction_id = room_code)';
COMMENT ON TABLE bid_history IS 'Audit trail of all bid activity';

COMMENT ON COLUMN auctions.room_code IS 'Unique 8-character code for accessing the auction room';
COMMENT ON COLUMN auctions.status IS 'Auction status: DRAFT, ACTIVE, CLOSED, CANCELLED';
COMMENT ON COLUMN auction_items.specifications IS 'JSONB field for flexible land/vehicle specifications';
COMMENT ON COLUMN bids.auction_id IS 'References the room_code from auctions table';
COMMENT ON COLUMN bid_history.auction_id IS 'References the room_code from auctions table';

-- ============================================
-- SAMPLE DATA (OPTIONAL - Uncomment to insert)
-- ============================================

/*
-- Insert sample auction
INSERT INTO auctions (seller_id, title, description, start_time, end_time, reserve_price, status, room_code)
VALUES
  ('seller-001', 'Prime Land Plot in Thimphu', 'Beautiful 2.5 acres near city center', NOW(), NOW() + INTERVAL '2 hours', 5000000, 'ACTIVE', 'LAND001'),
  ('seller-002', 'Toyota Land Cruiser 2020', 'Excellent condition, 25000 km', NOW(), NOW() + INTERVAL '3 hours', 2500000, 'ACTIVE', 'VEH001');

-- Insert corresponding auction items
INSERT INTO auction_items (auction_id, item_type, condition, location, specifications)
SELECT
  id,
  'LAND',
  'Excellent',
  'Thimphu',
  '{"land_size": "2.5 acres", "land_type": "Commercial"}'::jsonb
FROM auctions WHERE room_code = 'LAND001';

INSERT INTO auction_items (auction_id, item_type, condition, location, specifications)
SELECT
  id,
  'VEHICLE',
  'Excellent',
  'Paro',
  '{"make": "Toyota", "model": "Land Cruiser", "year": 2020, "mileage": 25000}'::jsonb
FROM auctions WHERE room_code = 'VEH001';

-- Insert corresponding auction rooms
INSERT INTO auction_rooms (auction_id, room_code)
SELECT id, room_code FROM auctions WHERE room_code IN ('LAND001', 'VEH001');
*/
