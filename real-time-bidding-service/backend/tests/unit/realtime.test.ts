/**
 * PERSON B - REALTIME SERVICE TESTS
 * 
 * Unit tests for realtime bidding and history functionality
 */

import { RealtimeService } from '../../src/services/realtime.service';
import { Bid } from '../../src/models/Bid';

// Mock dependencies
jest.mock('../../src/config', () => ({
  getSupabaseClient: jest.fn(),
}));

jest.mock('../../src/config/logger');

describe('RealtimeService - Person B Tests', () => {
  let service: RealtimeService;

  beforeEach(() => {
    service = new RealtimeService();
    jest.clearAllMocks();
  });

  describe('getBidHistory', () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
    };

    beforeEach(() => {
      const { getSupabaseClient } = require('../../src/config');
      getSupabaseClient.mockReturnValue(mockSupabase);
    });

    it('should return bid history for an auction', async () => {
      const mockBids: Bid[] = [
        {
          bid_id: 'bid-1',
          auction_id: 'test-auction',
          bidder_id: 'user-1',
          amount: 2000,
          bid_time: new Date(),
          is_winning: true,
          created_at: new Date(),
        },
        {
          bid_id: 'bid-2',
          auction_id: 'test-auction',
          bidder_id: 'user-2',
          amount: 1500,
          bid_time: new Date(),
          is_winning: false,
          created_at: new Date(),
        },
      ];

      mockSupabase.order.mockResolvedValue({ data: mockBids, error: null });

      const result = await service.getBidHistory('test-auction');

      expect(result).toEqual(mockBids);
      expect(mockSupabase.from).toHaveBeenCalledWith('bids');
      expect(mockSupabase.eq).toHaveBeenCalledWith('auction_id', 'test-auction');
      expect(mockSupabase.order).toHaveBeenCalledWith('bid_time', { ascending: false });
    });

    it('should return empty array when no bids exist', async () => {
      mockSupabase.order.mockResolvedValue({ data: [], error: null });

      const result = await service.getBidHistory('test-auction');

      expect(result).toEqual([]);
    });

    it('should throw error on database failure', async () => {
      mockSupabase.order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(service.getBidHistory('test-auction')).rejects.toThrow(
        'Failed to fetch bid history'
      );
    });
  });

  describe('getBidHistoryPaginated', () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
    };

    beforeEach(() => {
      const { getSupabaseClient } = require('../../src/config');
      getSupabaseClient.mockReturnValue(mockSupabase);
    });

    it('should return paginated bid history', async () => {
      const mockBids: Bid[] = Array.from({ length: 20 }, (_, i) => ({
        bid_id: `bid-${i}`,
        auction_id: 'test-auction',
        bidder_id: `user-${i}`,
        amount: 1000 + i * 100,
        bid_time: new Date(),
        is_winning: i === 0,
        created_at: new Date(),
      }));

      // Mock count query
      mockSupabase.select.mockReturnValueOnce({
        eq: mockSupabase.eq,
      });
      mockSupabase.eq.mockResolvedValueOnce({ count: 50, error: null });

      // Mock data query
      mockSupabase.select.mockReturnValueOnce(mockSupabase);
      mockSupabase.range.mockResolvedValueOnce({ data: mockBids, error: null });

      const result = await service.getBidHistoryPaginated('test-auction', 1, 20);

      expect(result.bids).toEqual(mockBids);
      expect(result.total).toBe(50);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(3); // 50 / 20 = 2.5, rounded up to 3
    });

    it('should calculate correct offset for page 2', async () => {
      mockSupabase.select.mockReturnValueOnce({
        eq: mockSupabase.eq,
      });
      mockSupabase.eq.mockResolvedValueOnce({ count: 50, error: null });

      mockSupabase.select.mockReturnValueOnce(mockSupabase);
      mockSupabase.range.mockResolvedValueOnce({ data: [], error: null });

      await service.getBidHistoryPaginated('test-auction', 2, 20);

      expect(mockSupabase.range).toHaveBeenCalledWith(20, 39); // Offset 20, limit 20
    });
  });

  describe('getBidStatistics', () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    };

    beforeEach(() => {
      const { getSupabaseClient } = require('../../src/config');
      getSupabaseClient.mockReturnValue(mockSupabase);
    });

    it('should calculate bid statistics correctly', async () => {
      const mockData = [
        { amount: 1000, bidder_id: 'user-1' },
        { amount: 1500, bidder_id: 'user-2' },
        { amount: 2000, bidder_id: 'user-1' },
        { amount: 2500, bidder_id: 'user-3' },
      ];

      mockSupabase.eq.mockResolvedValue({ data: mockData, error: null });

      const result = await service.getBidStatistics('test-auction');

      expect(result.total_bids).toBe(4);
      expect(result.unique_bidders).toBe(3);
      expect(result.highest_bid).toBe(2500);
      expect(result.average_bid).toBe(1750); // (1000 + 1500 + 2000 + 2500) / 4
      expect(result.bid_range.min).toBe(1000);
      expect(result.bid_range.max).toBe(2500);
    });

    it('should return zeros when no bids exist', async () => {
      mockSupabase.eq.mockResolvedValue({ data: [], error: null });

      const result = await service.getBidStatistics('test-auction');

      expect(result.total_bids).toBe(0);
      expect(result.unique_bidders).toBe(0);
      expect(result.highest_bid).toBe(0);
      expect(result.average_bid).toBe(0);
      expect(result.bid_range.min).toBe(0);
      expect(result.bid_range.max).toBe(0);
    });
  });

  describe('setupRealtimeChannel', () => {
    const mockChannel = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    };

    const mockSupabase = {
      channel: jest.fn().mockReturnValue(mockChannel),
    };

    beforeEach(() => {
      const { getSupabaseClient } = require('../../src/config');
      getSupabaseClient.mockReturnValue(mockSupabase);
    });

    it('should create and configure a new channel', () => {
      const channel = service.setupRealtimeChannel('test-auction');

      expect(mockSupabase.channel).toHaveBeenCalledWith('auction:test-auction:bids');
      expect(mockChannel.on).toHaveBeenCalledTimes(2); // INSERT and UPDATE
      expect(mockChannel.subscribe).toHaveBeenCalled();
      expect(channel).toBe(mockChannel);
    });

    it('should return existing channel if already setup', () => {
      // Setup channel first time
      service.setupRealtimeChannel('test-auction');
      jest.clearAllMocks();

      // Setup same channel again
      const channel = service.setupRealtimeChannel('test-auction');

      expect(mockSupabase.channel).not.toHaveBeenCalled(); // Should not create new channel
      expect(channel).toBe(mockChannel);
    });

    it('should subscribe to INSERT events', () => {
      service.setupRealtimeChannel('test-auction');

      const insertCall = mockChannel.on.mock.calls.find(
        (call) => call[0] === 'postgres_changes' && call[1].event === 'INSERT'
      );

      expect(insertCall).toBeDefined();
      expect(insertCall[1].table).toBe('bids');
      expect(insertCall[1].filter).toBe('auction_id=eq.test-auction');
    });

    it('should subscribe to UPDATE events', () => {
      service.setupRealtimeChannel('test-auction');

      const updateCall = mockChannel.on.mock.calls.find(
        (call) => call[0] === 'postgres_changes' && call[1].event === 'UPDATE'
      );

      expect(updateCall).toBeDefined();
      expect(updateCall[1].table).toBe('bids');
      expect(updateCall[1].filter).toBe('auction_id=eq.test-auction');
    });
  });

  describe('closeRealtimeChannel', () => {
    const mockChannel = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    };

    const mockSupabase = {
      channel: jest.fn().mockReturnValue(mockChannel),
    };

    beforeEach(() => {
      const { getSupabaseClient } = require('../../src/config');
      getSupabaseClient.mockReturnValue(mockSupabase);
    });

    it('should close an existing channel', () => {
      // Setup channel first
      service.setupRealtimeChannel('test-auction');

      // Close the channel
      service.closeRealtimeChannel('test-auction');

      expect(mockChannel.unsubscribe).toHaveBeenCalled();
      expect(service.getActiveChannels()).toHaveLength(0);
    });

    it('should handle closing non-existent channel gracefully', () => {
      expect(() => {
        service.closeRealtimeChannel('non-existent-auction');
      }).not.toThrow();
    });
  });

  describe('getActiveChannels', () => {
    const mockChannel = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    };

    const mockSupabase = {
      channel: jest.fn().mockReturnValue(mockChannel),
    };

    beforeEach(() => {
      const { getSupabaseClient } = require('../../src/config');
      getSupabaseClient.mockReturnValue(mockSupabase);
    });

    it('should return list of active channels', () => {
      service.setupRealtimeChannel('auction-1');
      service.setupRealtimeChannel('auction-2');
      service.setupRealtimeChannel('auction-3');

      const channels = service.getActiveChannels();

      expect(channels).toHaveLength(3);
      expect(channels).toContain('auction:auction-1:bids');
      expect(channels).toContain('auction:auction-2:bids');
      expect(channels).toContain('auction:auction-3:bids');
    });
  });

  describe('getUserBidHistory', () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    };

    beforeEach(() => {
      const { getSupabaseClient } = require('../../src/config');
      getSupabaseClient.mockReturnValue(mockSupabase);
    });

    it('should return user bid history', async () => {
      const mockBids: Bid[] = [
        {
          bid_id: 'bid-1',
          auction_id: 'auction-1',
          bidder_id: 'user-1',
          amount: 2000,
          bid_time: new Date(),
          is_winning: true,
          created_at: new Date(),
        },
      ];

      mockSupabase.limit.mockResolvedValue({ data: mockBids, error: null });

      const result = await service.getUserBidHistory('user-1', 50);

      expect(result).toEqual(mockBids);
      expect(mockSupabase.eq).toHaveBeenCalledWith('bidder_id', 'user-1');
      expect(mockSupabase.limit).toHaveBeenCalledWith(50);
    });
  });

  describe('getUserWinningBids', () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
    };

    beforeEach(() => {
      const { getSupabaseClient } = require('../../src/config');
      getSupabaseClient.mockReturnValue(mockSupabase);
    });

    it('should return only winning bids', async () => {
      const mockBids: Bid[] = [
        {
          bid_id: 'bid-1',
          auction_id: 'auction-1',
          bidder_id: 'user-1',
          amount: 2000,
          bid_time: new Date(),
          is_winning: true,
          created_at: new Date(),
        },
      ];

      mockSupabase.order.mockResolvedValue({ data: mockBids, error: null });

      const result = await service.getUserWinningBids('user-1');

      expect(result).toEqual(mockBids);
      expect(mockSupabase.eq).toHaveBeenCalledWith('bidder_id', 'user-1');
      expect(mockSupabase.eq).toHaveBeenCalledWith('is_winning', true);
    });
  });
});
