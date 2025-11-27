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
      const { data, error } = await supabase
        .from('auctions')
        .select('*')
        .eq('status', 'active')
        .order('end_time', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Error fetching active auctions:', error);
      throw new Error('Failed to fetch auctions');
    }
  }

  async getAuctionById(auctionId: string): Promise<Auction | null> {
    const supabase = getSupabaseClient();

    try {
      const { data, error } = await supabase
        .from('auctions')
        .select('*')
        .eq('auction_id', auctionId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('Error fetching auction:', error);
      return null;
    }
  }
}

export default new AuctionService();