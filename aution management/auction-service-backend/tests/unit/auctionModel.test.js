// Mock Supabase before requiring the model
jest.mock('../../src/utils/supabase');

const supabase = require('../../src/utils/supabase');
const AuctionModel = require('../../src/models/auctionModel');

describe('AuctionModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    test('should create auction with room code', async () => {
      const mockAuction = {
        id: '123',
        title: 'Test Auction',
        seller_id: 'user-1',
        room_code: 'ABC12345'
      };

      const mockRoom = {
        id: 'room-1',
        auction_id: '123',
        room_code: 'ABC12345',
        active: true,
        participant_count: 0
      };

      // Mock the auction insert
      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockAuction, error: null })
          })
        })
      });

      // Create a spy for the createRoom method
      const createRoomSpy = jest.spyOn(AuctionModel, 'createRoom').mockResolvedValue(mockRoom);

      const result = await AuctionModel.create({
        title: 'Test Auction',
        seller_id: 'user-1'
      });

      expect(result).toEqual(mockAuction);
      expect(createRoomSpy).toHaveBeenCalledWith('123', expect.any(String));
      expect(result.room_code).toHaveLength(8);

      createRoomSpy.mockRestore();
    });

    test('should throw error if auction creation fails', async () => {
      const mockError = new Error('Database error');

      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: mockError })
          })
        })
      });

      await expect(AuctionModel.create({ title: 'Test' })).rejects.toThrow('Database error');
    });
  });

  describe('getAll', () => {
    test('should get all auctions with default pagination', async () => {
      const mockAuctions = [
        { id: '1', title: 'Auction 1' },
        { id: '2', title: 'Auction 2' }
      ];

      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: mockAuctions, error: null })
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery)
      });

      const result = await AuctionModel.getAll();

      expect(result).toEqual(mockAuctions);
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockQuery.range).toHaveBeenCalledWith(0, 19); // page 1, limit 20
    });

    test('should apply status filter', async () => {
      const mockAuctions = [{ id: '1', title: 'Auction 1', status: 'ACTIVE' }];

      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: mockAuctions, error: null })
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery)
      });

      await AuctionModel.getAll({ status: 'ACTIVE' });

      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'ACTIVE');
    });

    test('should apply seller_id filter', async () => {
      const mockAuctions = [{ id: '1', title: 'Auction 1', seller_id: 'user-1' }];

      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: mockAuctions, error: null })
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery)
      });

      await AuctionModel.getAll({ seller_id: 'user-1' });

      expect(mockQuery.eq).toHaveBeenCalledWith('seller_id', 'user-1');
    });

    test('should apply custom pagination', async () => {
      const mockAuctions = [{ id: '1', title: 'Auction 1' }];

      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: mockAuctions, error: null })
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery)
      });

      await AuctionModel.getAll({ page: 2, limit: 10 });

      expect(mockQuery.range).toHaveBeenCalledWith(10, 19); // page 2, limit 10
    });
  });

  describe('getById', () => {
    test('should get auction by id', async () => {
      const mockAuction = { id: '123', title: 'Test Auction' };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockAuction, error: null })
          })
        })
      });

      const result = await AuctionModel.getById('123');

      expect(result).toEqual(mockAuction);
    });

    test('should throw error if auction not found', async () => {
      const mockError = new Error('Not found');

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: mockError })
          })
        })
      });

      await expect(AuctionModel.getById('999')).rejects.toThrow('Not found');
    });
  });

  describe('getByRoomCode', () => {
    test('should get auction by room code', async () => {
      const mockAuction = { id: '123', room_code: 'ABC12345' };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockAuction, error: null })
          })
        })
      });

      const result = await AuctionModel.getByRoomCode('ABC12345');

      expect(result).toEqual(mockAuction);
    });
  });

  describe('update', () => {
    test('should update auction', async () => {
      const mockUpdated = { id: '123', title: 'Updated Title' };

      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockUpdated, error: null })
            })
          })
        })
      });

      const result = await AuctionModel.update('123', { title: 'Updated Title' });

      expect(result).toEqual(mockUpdated);
    });

    test('should include updated_at timestamp', async () => {
      const mockUpdated = { id: '123', title: 'Updated Title' };
      let capturedUpdate = null;

      supabase.from.mockReturnValue({
        update: jest.fn().mockImplementation((data) => {
          capturedUpdate = data;
          return {
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockUpdated, error: null })
              })
            })
          };
        })
      });

      await AuctionModel.update('123', { title: 'Updated Title' });

      expect(capturedUpdate).toHaveProperty('updated_at');
      expect(capturedUpdate.updated_at).toBeInstanceOf(Date);
    });
  });

  describe('delete', () => {
    test('should soft delete auction by setting status to CANCELLED', async () => {
      const mockCancelled = { id: '123', status: 'CANCELLED' };

      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockCancelled, error: null })
            })
          })
        })
      });

      const result = await AuctionModel.delete('123');

      expect(result.status).toBe('CANCELLED');
    });
  });

  describe('search', () => {
    test('should search auctions by term', async () => {
      const mockResults = [
        { id: '1', title: 'Land Auction' },
        { id: '2', title: 'Vehicle Auction' }
      ];

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockResults, error: null })
          })
        })
      });

      const result = await AuctionModel.search('auction');

      expect(result).toEqual(mockResults);
    });
  });

  describe('updateRoomParticipants', () => {
    test('should update participant count', async () => {
      const mockRoom = { room_code: 'ABC12345', participant_count: 5 };

      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockRoom, error: null })
            })
          })
        })
      });

      const result = await AuctionModel.updateRoomParticipants('ABC12345', 5);

      expect(result.participant_count).toBe(5);
    });
  });

  describe('getActiveRooms', () => {
    test('should get all active rooms', async () => {
      const mockRooms = [
        { room_code: 'ABC12345', active: true },
        { room_code: 'XYZ98765', active: true }
      ];

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockRooms, error: null })
          })
        })
      });

      const result = await AuctionModel.getActiveRooms();

      expect(result).toEqual(mockRooms);
      expect(result).toHaveLength(2);
    });
  });
});
