/**
 * PERSON A - BID PROCESSING SERVICE
 * 
 * Responsibilities:
 * - Validate bid amounts
 * - Check and update highest bid
 * - Process bid placement
 * - Redis cache management for bids
 * - Mock service integrations (User & Auction services)
 */

import { getSupabaseClient, getRedisClient } from '../config';
import { CreateBidInput, Bid, BidValidation, HighestBid } from '../models/Bid';
import { ValidationError, UnauthorizedError } from '../middleware/errorHandler';import logger from '../config/logger';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { serviceUrls, cacheTTL } from '../config';

export class BidProcessingService {
  /**
   * Validate bid amount against auction rules
   */
  async validateBidAmount(
    auctionId: string,
    amount: number,
    bidderId: string
  ): Promise<BidValidation> {
    try {
      // Get auction details (mock call to auction service)
      const auctionData = await this.getAuctionDetails(auctionId);

      if (!auctionData.is_active) {
        return {
          valid: false,
          message: 'Auction is not active',
        };
      }

      // Check if auction has ended
      const now = new Date();
      const endTime = new Date(auctionData.end_time);
      if (now > endTime) {
        return {
          valid: false,
          message: 'Auction has ended',
        };
      }

      // Get current highest bid
      const highestBid = await this.getHighestBid(auctionId);
      const currentHighest = highestBid?.amount || auctionData.reserve_price;

      // Bid must be higher than current highest bid
      const minimumBid = currentHighest + 100; // Minimum increment of Nu 100
      if (amount <= currentHighest) {
        return {
          valid: false,
          message: `Bid must be higher than current bid of Nu ${currentHighest}`,
          current_highest_bid: currentHighest,
        };
      }

      if (amount < minimumBid) {
        return {
          valid: false,
          message: `Minimum bid is Nu ${minimumBid}`,
          current_highest_bid: currentHighest,
        };
      }

      // Check if bidder is the current highest bidder
      if (highestBid && highestBid.bidder_id === bidderId) {
        return {
          valid: false,
          message: 'You are already the highest bidder',
          current_highest_bid: currentHighest,
        };
      }

      return {
        valid: true,
        message: 'Bid is valid',
        current_highest_bid: currentHighest,
        reserve_price: auctionData.reserve_price,
      };
    } catch (error) {
      logger.error('Error validating bid amount:', error);
      throw error;
    }
  }

  /**
   * Place a new bid
   */
  async placeBid(bidInput: CreateBidInput): Promise<Bid> {
    const supabase = getSupabaseClient();

    try {
      // Step 1: Verify user authentication (mock call)
      const userVerified = await this.verifyUser(bidInput.bidder_id);
      if (!userVerified) {
        throw new UnauthorizedError('User not authenticated or verified');
      }

      // Step 2: Validate bid amount
      const validation = await this.validateBidAmount(
        bidInput.auction_id,
        bidInput.amount,
        bidInput.bidder_id
      );

      if (!validation.valid) {
        throw new ValidationError(validation.message || 'Invalid bid amount');
      }

      // Step 3: Create bid record
      const newBid: Omit<Bid, 'created_at'> = {
        bid_id: uuidv4(),
        auction_id: bidInput.auction_id,
        bidder_id: bidInput.bidder_id,
        amount: bidInput.amount,
        bid_time: new Date(),
        is_winning: true, // Initially set as winning
      };

      // Step 4: Insert into database
      const { data, error } = await supabase
        .from('bids')
        .insert([newBid])
        .select()
        .single();

      if (error) {
        logger.error('Database error creating bid:', error);
        throw new Error('Failed to create bid');
      }

      const createdBid = data as Bid;

      // Step 5: Update previous winning bid to not winning
      await this.updatePreviousWinningBid(bidInput.auction_id, createdBid.bid_id);

      // Step 6: Update Redis cache with new highest bid
      await this.updateHighestBidCache(bidInput.auction_id, {
        bid_id: createdBid.bid_id,
        amount: createdBid.amount,
        bidder_id: createdBid.bidder_id,
        bid_time: createdBid.bid_time,
      });

      // Step 7: Log the transaction
      await this.logBidTransaction(createdBid);

      logger.info('Bid placed successfully:', {
        bid_id: createdBid.bid_id,
        auction_id: bidInput.auction_id,
        amount: bidInput.amount,
      });

      return createdBid;
    } catch (error) {
      logger.error('Error placing bid:', error);
      throw error;
    }
  }

  /**
   * Get highest bid for an auction (with Redis caching)
   */
  async getHighestBid(auctionId: string): Promise<HighestBid | null> {
    const redis = await getRedisClient();
    const cacheKey = `highest_bid:${auctionId}`;

    try {
      // Try cache first
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.debug('Cache hit for highest bid:', auctionId);
        return JSON.parse(cached);
      }

      // Cache miss - query database
      logger.debug('Cache miss for highest bid, querying database');
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('bids')
        .select('bid_id, amount, bidder_id, bid_time')
        .eq('auction_id', auctionId)
        .eq('is_winning', true)
        .order('amount', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "no rows returned"
        logger.error('Error getting highest bid:', error);
        return null;
      }

      const highestBid = data as HighestBid | null;

      // Update cache
      if (highestBid) {
        await redis.setEx(cacheKey, cacheTTL.bid, JSON.stringify(highestBid));
      }

      return highestBid;
    } catch (error) {
      logger.error('Error in getHighestBid:', error);
      return null;
    }
  }

  /**
   * Update previous winning bid status
   */
  private async updatePreviousWinningBid(
    auctionId: string,
    newWinningBidId: string
  ): Promise<void> {
    const supabase = getSupabaseClient();

    try {
      await supabase
        .from('bids')
        .update({ is_winning: false })
        .eq('auction_id', auctionId)
        .eq('is_winning', true)
        .neq('bid_id', newWinningBidId);
    } catch (error) {
      logger.error('Error updating previous winning bid:', error);
    }
  }

  /**
   * Update Redis cache with highest bid
   */
  private async updateHighestBidCache(
    auctionId: string,
    highestBid: HighestBid
  ): Promise<void> {
    const redis = await getRedisClient();
    const cacheKey = `highest_bid:${auctionId}`;

    try {
      await redis.setEx(cacheKey, cacheTTL.bid, JSON.stringify(highestBid));
      logger.debug('Updated highest bid cache for auction:', auctionId);
    } catch (error) {
      logger.error('Error updating highest bid cache:', error);
    }
  }

  /**
   * Log bid transaction for audit
   */
  private async logBidTransaction(bid: Bid): Promise<void> {
    const supabase = getSupabaseClient();

    try {
      await supabase.from('bid_history').insert([
        {
          history_id: uuidv4(),
          auction_id: bid.auction_id,
          bid_data: bid,
          event_type: 'BID_PLACED',
          created_at: new Date(),
        },
      ]);
    } catch (error) {
      logger.error('Error logging bid transaction:', error);
    }
  }

  /**
   * Mock call to User Service to verify user
   */
  private async verifyUser(userId: string): Promise<boolean> {
    try {
      // In production, this would call the actual User Service
      // For now, we'll mock the response
      if (process.env.NODE_ENV === 'test') {
        return true;
      }

      // Mock API call
      const response = await axios.get(
        `${serviceUrls.userService}/api/users/${userId}/verify`,
        { timeout: 5000 }
      );
      return response.data.is_verified && response.data.is_authenticated;
    } catch (error) {
      logger.warn('User service unavailable, using mock verification');
      // For development, assume user is verified
      return true;
    }
  }

  /**
   * Mock call to Auction Service to get auction details
   */
  private async getAuctionDetails(auctionId: string): Promise<any> {
    const redis = await getRedisClient();
    const cacheKey = `auction:${auctionId}`;

    try {
      // Check cache first
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // In production, this would call the actual Auction Service
      if (process.env.NODE_ENV === 'test') {
        return {
          auction_id: auctionId,
          is_active: true,
          reserve_price: 1000,
          current_bid: 1000,
          end_time: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
        };
      }

      // Mock API call
      const response = await axios.get(
        `${serviceUrls.auctionService}/api/auctions/${auctionId}`,
        { timeout: 5000 }
      );

      const auctionData = response.data.data;

      // Cache the result
      await redis.setEx(cacheKey, cacheTTL.auction, JSON.stringify(auctionData));

      return auctionData;
    } catch (error) {
      logger.warn('Auction service unavailable, using mock data');
      // For development, return mock auction data
      return {
        auction_id: auctionId,
        is_active: true,
        reserve_price: 1000,
        current_bid: 1000,
        end_time: new Date(Date.now() + 86400000).toISOString(),
      };
    }
  }

  /**
   * Invalidate cache for an auction (used when auction is updated)
   */
  async invalidateAuctionCache(auctionId: string): Promise<void> {
    const redis = await getRedisClient();
    const keys = [`auction:${auctionId}`, `highest_bid:${auctionId}`];

    try {
      await redis.del(keys);
      logger.debug('Invalidated cache for auction:', auctionId);
    } catch (error) {
      logger.error('Error invalidating cache:', error);
    }
  }
}

export default new BidProcessingService();
