/**
 * PERSON B - REALTIME & HISTORY SERVICE
 * 
 * Responsibilities:
 * - Manage Supabase Realtime channels
 * - Broadcast bid updates to all users
 * - Retrieve bid history
 * - Handle WebSocket connections
 */

import { getSupabaseClient } from '../config';
import { Bid, BidHistory, RealtimeBidEvent } from '../models/Bid';
import logger from '../config/logger';
import { RealtimeChannel } from '@supabase/supabase-js';

export class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();

  /**
   * Get all bids for an auction
   */
  async getBidHistory(auctionId: string): Promise<Bid[]> {
    const supabase = getSupabaseClient();

    try {
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('auction_id', auctionId)
        .order('bid_time', { ascending: false });

      if (error) {
        logger.error('Error fetching bid history:', error);
        throw new Error('Failed to fetch bid history');
      }

      if (!data || data.length === 0) {
        logger.info('No bids found for auction:', auctionId);
        return [];
      }

      return data as Bid[];
    } catch (error) {
      logger.error('Error in getBidHistory:', error);
      throw error;
    }
  }

  /**
   * Get bid history with pagination
   */
  async getBidHistoryPaginated(
    auctionId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ bids: Bid[]; total: number; page: number; totalPages: number }> {
    const supabase = getSupabaseClient();

    try {
      // Get total count
      const { count, error: countError } = await supabase
        .from('bids')
        .select('*', { count: 'exact', head: true })
        .eq('auction_id', auctionId);

      if (countError) {
        throw countError;
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;

      // Get paginated data
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('auction_id', auctionId)
        .order('bid_time', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return {
        bids: (data as Bid[]) || [],
        total,
        page,
        totalPages,
      };
    } catch (error) {
      logger.error('Error in getBidHistoryPaginated:', error);
      throw error;
    }
  }

  /**
   * Get full audit history from bid_history table
   */
  async getAuditHistory(auctionId: string): Promise<BidHistory[]> {
    const supabase = getSupabaseClient();

    try {
      const { data, error } = await supabase
        .from('bid_history')
        .select('*')
        .eq('auction_id', auctionId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching audit history:', error);
        throw new Error('Failed to fetch audit history');
      }

      return (data as BidHistory[]) || [];
    } catch (error) {
      logger.error('Error in getAuditHistory:', error);
      throw error;
    }
  }

  /**
   * Get bid statistics for an auction
   */
  async getBidStatistics(auctionId: string): Promise<{
    total_bids: number;
    unique_bidders: number;
    highest_bid: number;
    average_bid: number;
    bid_range: { min: number; max: number };
  }> {
    const supabase = getSupabaseClient();

    try {
      const { data, error } = await supabase
        .from('bids')
        .select('amount, bidder_id')
        .eq('auction_id', auctionId);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          total_bids: 0,
          unique_bidders: 0,
          highest_bid: 0,
          average_bid: 0,
          bid_range: { min: 0, max: 0 },
        };
      }

      const amounts = data.map((b) => b.amount);
      const uniqueBidders = new Set(data.map((b) => b.bidder_id));

      return {
        total_bids: data.length,
        unique_bidders: uniqueBidders.size,
        highest_bid: Math.max(...amounts),
        average_bid: amounts.reduce((a, b) => a + b, 0) / amounts.length,
        bid_range: {
          min: Math.min(...amounts),
          max: Math.max(...amounts),
        },
      };
    } catch (error) {
      logger.error('Error calculating bid statistics:', error);
      throw error;
    }
  }

  /**
   * Setup Supabase Realtime channel for an auction
   */
  setupRealtimeChannel(auctionId: string): RealtimeChannel {
    const supabase = getSupabaseClient();
    const channelName = `auction:${auctionId}:bids`;

    // Check if channel already exists
    if (this.channels.has(channelName)) {
      logger.debug('Realtime channel already exists:', channelName);
      return this.channels.get(channelName)!;
    }

    // Create new channel
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `auction_id=eq.${auctionId}`,
        },
        (payload) => {
          logger.info('New bid received via Realtime:', payload);
          this.handleNewBid(auctionId, payload.new as Bid);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bids',
          filter: `auction_id=eq.${auctionId}`,
        },
        (payload) => {
          logger.info('Bid updated via Realtime:', payload);
          this.handleBidUpdate(auctionId, payload.new as Bid);
        }
      )
      .subscribe((status) => {
        logger.info(`Realtime channel ${channelName} status:`, status);
      });

    this.channels.set(channelName, channel);
    logger.info('Created new Realtime channel:', channelName);

    return channel;
  }

  /**
   * Broadcast bid update to all connected clients
   */
  async broadcastBidUpdate(auctionId: string, bid: Bid): Promise<void> {
    const supabase = getSupabaseClient();
    const channelName = `auction:${auctionId}:bids`;

    try {
      const event: RealtimeBidEvent = {
        type: 'NEW_BID',
        bid,
        auction_id: auctionId,
        timestamp: new Date(),
      };

      // Send broadcast message
      await supabase.channel(channelName).send({
        type: 'broadcast',
        event: 'new-bid',
        payload: event,
      });

      logger.info('Broadcast bid update:', { auctionId, bid_id: bid.bid_id });
    } catch (error) {
      logger.error('Error broadcasting bid update:', error);
    }
  }

  /**
   * Handle new bid received from Realtime
   */
  private handleNewBid(auctionId: string, bid: Bid): void {
    logger.info('Processing new bid from Realtime:', {
      auction_id: auctionId,
      bid_id: bid.bid_id,
      amount: bid.amount,
    });

    // Here you could trigger additional actions like:
    // - Send notifications to outbid users
    // - Update statistics
    // - Trigger webhooks
  }

  /**
   * Handle bid update from Realtime
   */
  private handleBidUpdate(auctionId: string, bid: Bid): void {
    logger.info('Processing bid update from Realtime:', {
      auction_id: auctionId,
      bid_id: bid.bid_id,
      is_winning: bid.is_winning,
    });
  }

  /**
   * Close Realtime channel
   */
  closeRealtimeChannel(auctionId: string): void {
    const channelName = `auction:${auctionId}:bids`;
    const channel = this.channels.get(channelName);

    if (channel) {
      channel.unsubscribe();
      this.channels.delete(channelName);
      logger.info('Closed Realtime channel:', channelName);
    }
  }

  /**
   * Get all active channels
   */
  getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  /**
   * Close all channels (for cleanup)
   */
  closeAllChannels(): void {
    this.channels.forEach((channel, name) => {
      channel.unsubscribe();
      logger.info('Closed channel:', name);
    });
    this.channels.clear();
  }

  /**
   * Get recent bids (last N bids across all auctions)
   */
  async getRecentBids(limit: number = 10): Promise<Bid[]> {
    const supabase = getSupabaseClient();

    try {
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .order('bid_time', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return (data as Bid[]) || [];
    } catch (error) {
      logger.error('Error fetching recent bids:', error);
      throw error;
    }
  }

  /**
   * Get user's bid history
   */
  async getUserBidHistory(userId: string, limit: number = 50): Promise<Bid[]> {
    const supabase = getSupabaseClient();

    try {
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('bidder_id', userId)
        .order('bid_time', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return (data as Bid[]) || [];
    } catch (error) {
      logger.error('Error fetching user bid history:', error);
      throw error;
    }
  }

  /**
   * Check if user is winning any auctions
   */
  async getUserWinningBids(userId: string): Promise<Bid[]> {
    const supabase = getSupabaseClient();

    try {
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('bidder_id', userId)
        .eq('is_winning', true)
        .order('bid_time', { ascending: false });

      if (error) {
        throw error;
      }

      return (data as Bid[]) || [];
    } catch (error) {
      logger.error('Error fetching user winning bids:', error);
      throw error;
    }
  }
}

export default new RealtimeService();
