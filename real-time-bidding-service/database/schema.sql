-- Recreate bids table with TEXT auction_id
CREATE TABLE bids (
  bid_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id TEXT NOT NULL,
  bidder_id TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  bid_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_winning BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate bid_history table with TEXT auction_id
CREATE TABLE bid_history (
  history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id UUID REFERENCES bids(bid_id) ON DELETE CASCADE,
  auction_id TEXT NOT NULL,
  bidder_id TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  bid_time TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'placed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_bids_auction ON bids(auction_id);
CREATE INDEX idx_bids_bidder ON bids(bidder_id);
CREATE INDEX idx_bids_time ON bids(bid_time DESC);
CREATE INDEX idx_history_auction ON bid_history(auction_id);
CREATE INDEX idx_history_bidder ON bid_history(bidder_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE bids;