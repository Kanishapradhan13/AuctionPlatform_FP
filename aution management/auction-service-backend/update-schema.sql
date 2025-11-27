-- Update reserve_price and current_highest_bid to support larger numbers
-- This allows values up to 999,999,999,999.99 (999 billion)

ALTER TABLE auctions
ALTER COLUMN reserve_price TYPE DECIMAL(14,2);

ALTER TABLE auctions
ALTER COLUMN current_highest_bid TYPE DECIMAL(14,2);
