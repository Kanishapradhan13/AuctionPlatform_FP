import { getSupabaseClient } from '../config';

import logger from '../config/logger';

interface Auction {
  auction_id: string;
  title: string;
  description: string;
  item_type: string;
  starting_bid: number;
  reserve_price: number;
  start_time: string;
  end_time: string;
  status: string;
  seller_id: string;
}

class AuctionService {
  async getActiveAuctions(): Promise<Auction[]> {
    const supabase = getSupabaseClient();

    try {
      // Query auctions with their items to get item_type
      const { data, error } = await supabase
        .from('auctions')
        .select(`
          *,
          auction_items(item_type)
        `)
        .eq('status', 'ACTIVE') // Match the uppercase status used in auction management
        .order('end_time', { ascending: true });

      if (error) throw error;

      // Map the response to match the expected interface
      const mappedData = (data || []).map((auction: any) => ({
        auction_id: auction.room_code, // Use room_code as auction_id
        title: auction.title,
        description: auction.description,
        item_type: auction.auction_items?.[0]?.item_type || 'GENERAL',
        starting_bid: auction.reserve_price,
        reserve_price: auction.reserve_price,
        start_time: auction.start_time,
        end_time: auction.end_time,
        status: auction.status.toLowerCase(),
        seller_id: auction.seller_id
      }));

      return mappedData;
    } catch (error) {
      logger.error('Error fetching active auctions:', error);
      throw new Error('Failed to fetch auctions');
    }
  }

  async getAuctionById(auctionId: string): Promise<Auction | null> {
    const supabase = getSupabaseClient();

    try {
      // Query by room_code since that's what we use as the identifier in URLs
      const { data, error } = await supabase
        .from('auctions')
        .select(`
          *,
          auction_items(item_type)
        `)
        .eq('room_code', auctionId)
        .single();

      if (error) throw error;

      // Map the response to match the expected interface
      if (data) {
        return {
          auction_id: data.room_code, // Use room_code as auction_id for consistency
          title: data.title,
          description: data.description,
          item_type: (data as any).auction_items?.[0]?.item_type || 'GENERAL',
          starting_bid: data.reserve_price, // Use reserve_price as starting bid
          reserve_price: data.reserve_price,
          start_time: data.start_time,
          end_time: data.end_time,
          status: data.status.toLowerCase(),
          seller_id: data.seller_id
        };
      }

      return data;
    } catch (error) {
      logger.error('Error fetching auction:', error);
      return null;
    }
  }
}

export default new AuctionService();