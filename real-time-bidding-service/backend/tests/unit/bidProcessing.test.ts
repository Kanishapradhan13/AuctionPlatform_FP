/**
 * PERSON A - BID PROCESSING SERVICE TESTS
 * 
 * Unit tests for bid validation and processing logic
 */

import { BidProcessingService } from '../../src/services/bidProcessing.service';
import { ValidationError } from '../../src/middleware/errorHandler';

// Mock dependencies
jest.mock('../../src/config', () => ({
  getSupabaseClient: jest.fn(),
  getRedisClient: jest.fn(),
  serviceUrls: {
    userService: 'http://localhost:3001',
    auctionService: 'http://localhost:3002',
  },
  cacheTTL: {
    bid: 300,
    auction: 600,
  },
}));

jest.mock('../../src/config/logger');

describe('BidProcessingService - Person A Tests', () => {
  let service: BidProcessingService;

  beforeEach(() => {
    service = new BidProcessingService();
    jest.clearAllMocks();
  });

  describe('validateBidAmount', () => {
    it('should validate a valid bid amount', async () => {
      // Mock auction data
      jest.spyOn(service as any, 'getAuctionDetails').mockResolvedValue({
        auction_id: 'test-auction-id',
        is_active: true,
        reserve_price: 1000,
        current_bid: 1500,
        end_time: new Date(Date.now() + 86400000).toISOString(),
      });

      // Mock highest bid
      jest.spyOn(service, 'getHighestBid').mockResolvedValue({
        bid_id: 'prev-bid-id',
        amount: 1500,
        bidder_id: 'other-user',
        bid_time: new Date(),
      });

      const result = await service.validateBidAmount(
        'test-auction-id',
        2000,
        'test-user-id'
      );

      expect(result.valid).toBe(true);
      expect(result.message).toBe('Bid is valid');
      expect(result.current_highest_bid).toBe(1500);
    });

    it('should reject bid below current highest', async () => {
      jest.spyOn(service as any, 'getAuctionDetails').mockResolvedValue({
        auction_id: 'test-auction-id',
        is_active: true,
        reserve_price: 1000,
        current_bid: 2000,
        end_time: new Date(Date.now() + 86400000).toISOString(),
      });

      jest.spyOn(service, 'getHighestBid').mockResolvedValue({
        bid_id: 'prev-bid-id',
        amount: 2000,
        bidder_id: 'other-user',
        bid_time: new Date(),
      });

      const result = await service.validateBidAmount(
        'test-auction-id',
        1800,
        'test-user-id'
      );

      expect(result.valid).toBe(false);
      expect(result.message).toContain('must be higher than');
    });

    it('should reject bid for inactive auction', async () => {
      jest.spyOn(service as any, 'getAuctionDetails').mockResolvedValue({
        auction_id: 'test-auction-id',
        is_active: false,
        reserve_price: 1000,
        current_bid: 1500,
        end_time: new Date(Date.now() + 86400000).toISOString(),
      });

      const result = await service.validateBidAmount(
        'test-auction-id',
        2000,
        'test-user-id'
      );

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Auction is not active');
    });

    it('should reject bid for ended auction', async () => {
      jest.spyOn(service as any, 'getAuctionDetails').mockResolvedValue({
        auction_id: 'test-auction-id',
        is_active: true,
        reserve_price: 1000,
        current_bid: 1500,
        end_time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      });

      const result = await service.validateBidAmount(
        'test-auction-id',
        2000,
        'test-user-id'
      );

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Auction has ended');
    });

    it('should reject bid from current highest bidder', async () => {
      jest.spyOn(service as any, 'getAuctionDetails').mockResolvedValue({
        auction_id: 'test-auction-id',
        is_active: true,
        reserve_price: 1000,
        current_bid: 1500,
        end_time: new Date(Date.now() + 86400000).toISOString(),
      });

      jest.spyOn(service, 'getHighestBid').mockResolvedValue({
        bid_id: 'prev-bid-id',
        amount: 1500,
        bidder_id: 'test-user-id', // Same as current bidder
        bid_time: new Date(),
      });

      const result = await service.validateBidAmount(
        'test-auction-id',
        2000,
        'test-user-id'
      );

      expect(result.valid).toBe(false);
      expect(result.message).toBe('You are already the highest bidder');
    });

    it('should enforce minimum bid increment', async () => {
      jest.spyOn(service as any, 'getAuctionDetails').mockResolvedValue({
        auction_id: 'test-auction-id',
        is_active: true,
        reserve_price: 1000,
        current_bid: 1500,
        end_time: new Date(Date.now() + 86400000).toISOString(),
      });

      jest.spyOn(service, 'getHighestBid').mockResolvedValue({
        bid_id: 'prev-bid-id',
        amount: 1500,
        bidder_id: 'other-user',
        bid_time: new Date(),
      });

      // Bid with only Nu 50 increment (minimum is Nu 100)
      const result = await service.validateBidAmount(
        'test-auction-id',
        1550,
        'test-user-id'
      );

      expect(result.valid).toBe(false);
      expect(result.message).toContain('Minimum bid is Nu 1600');
    });
  });

  describe('placeBid', () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    const mockRedis = {
      get: jest.fn(),
      setEx: jest.fn(),
      del: jest.fn(),
    };

    beforeEach(() => {
      const { getSupabaseClient, getRedisClient } = require('../../src/config');
      getSupabaseClient.mockReturnValue(mockSupabase);
      getRedisClient.mockResolvedValue(mockRedis);
    });

    it('should successfully place a valid bid', async () => {
      // Mock user verification
      jest.spyOn(service as any, 'verifyUser').mockResolvedValue(true);

      // Mock bid validation
      jest.spyOn(service, 'validateBidAmount').mockResolvedValue({
        valid: true,
        message: 'Bid is valid',
        current_highest_bid: 1500,
      });

      // Mock database insert
      const mockBid = {
        bid_id: 'new-bid-id',
        auction_id: 'test-auction-id',
        bidder_id: 'test-user-id',
        amount: 2000,
        bid_time: new Date(),
        is_winning: true,
        created_at: new Date(),
      };
      mockSupabase.single.mockResolvedValue({ data: mockBid, error: null });

      // Mock other methods
      jest.spyOn(service as any, 'updatePreviousWinningBid').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'updateHighestBidCache').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'logBidTransaction').mockResolvedValue(undefined);

      const result = await service.placeBid({
        auction_id: 'test-auction-id',
        bidder_id: 'test-user-id',
        amount: 2000,
      });

      expect(result).toEqual(mockBid);
      expect(mockSupabase.from).toHaveBeenCalledWith('bids');
      expect(mockSupabase.insert).toHaveBeenCalled();
    });

    it('should throw error for unverified user', async () => {
      jest.spyOn(service as any, 'verifyUser').mockResolvedValue(false);

      await expect(
        service.placeBid({
          auction_id: 'test-auction-id',
          bidder_id: 'unverified-user',
          amount: 2000,
        })
      ).rejects.toThrow('User not authenticated or verified');
    });

    it('should throw validation error for invalid bid', async () => {
      jest.spyOn(service as any, 'verifyUser').mockResolvedValue(true);

      jest.spyOn(service, 'validateBidAmount').mockResolvedValue({
        valid: false,
        message: 'Bid amount too low',
      });

      await expect(
        service.placeBid({
          auction_id: 'test-auction-id',
          bidder_id: 'test-user-id',
          amount: 500,
        })
      ).rejects.toThrow('Bid amount too low');
    });
  });

  describe('getHighestBid', () => {
    const mockRedis = {
      get: jest.fn(),
      setEx: jest.fn(),
    };

    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    beforeEach(() => {
      const { getSupabaseClient, getRedisClient } = require('../../src/config');
      getSupabaseClient.mockReturnValue(mockSupabase);
      getRedisClient.mockResolvedValue(mockRedis);
    });

    it('should return cached highest bid', async () => {
      const cachedBid = {
        bid_id: 'cached-bid-id',
        amount: 2000,
        bidder_id: 'test-user-id',
        bid_time: new Date(),
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(cachedBid));

      const result = await service.getHighestBid('test-auction-id');

      expect(result).toEqual(cachedBid);
      expect(mockRedis.get).toHaveBeenCalledWith('highest_bid:test-auction-id');
      expect(mockSupabase.from).not.toHaveBeenCalled(); // Should not hit database
    });

    it('should fetch from database on cache miss', async () => {
      mockRedis.get.mockResolvedValue(null);

      const dbBid = {
        bid_id: 'db-bid-id',
        amount: 2000,
        bidder_id: 'test-user-id',
        bid_time: new Date(),
      };

      mockSupabase.single.mockResolvedValue({ data: dbBid, error: null });

      const result = await service.getHighestBid('test-auction-id');

      expect(result).toEqual(dbBid);
      expect(mockSupabase.from).toHaveBeenCalledWith('bids');
      expect(mockRedis.setEx).toHaveBeenCalled(); // Should cache the result
    });

    it('should return null when no bids exist', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await service.getHighestBid('test-auction-id');

      expect(result).toBeNull();
    });
  });
});
