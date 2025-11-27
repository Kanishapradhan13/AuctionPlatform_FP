// Mock Supabase before requiring the model
jest.mock('../../src/utils/supabase');

const supabase = require('../../src/utils/supabase');
const ItemModel = require('../../src/models/itemModel');

describe('ItemModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    test('should create item successfully', async () => {
      const mockItem = {
        id: 'item-1',
        auction_id: 'auction-1',
        item_type: 'LAND',
        specifications: {
          land_size: '1000 sq ft',
          land_type: 'Residential'
        }
      };

      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockItem, error: null })
          })
        })
      });

      const result = await ItemModel.create({
        auction_id: 'auction-1',
        item_type: 'LAND',
        specifications: {
          land_size: '1000 sq ft',
          land_type: 'Residential'
        }
      });

      expect(result).toEqual(mockItem);
      expect(supabase.from).toHaveBeenCalledWith('auction_items');
    });

    test('should throw error if item creation fails', async () => {
      const mockError = new Error('Database error');

      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: mockError })
          })
        })
      });

      await expect(ItemModel.create({ item_type: 'LAND' })).rejects.toThrow('Database error');
    });
  });

  describe('getByAuctionId', () => {
    test('should get item by auction id', async () => {
      const mockItem = {
        id: 'item-1',
        auction_id: 'auction-1',
        item_type: 'VEHICLE'
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockItem, error: null })
          })
        })
      });

      const result = await ItemModel.getByAuctionId('auction-1');

      expect(result).toEqual(mockItem);
    });

    test('should throw error if item not found', async () => {
      const mockError = new Error('Not found');

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: mockError })
          })
        })
      });

      await expect(ItemModel.getByAuctionId('999')).rejects.toThrow('Not found');
    });
  });

  describe('update', () => {
    test('should update item successfully', async () => {
      const mockUpdated = {
        id: 'item-1',
        specifications: {
          land_size: '2000 sq ft',
          land_type: 'Commercial'
        }
      };

      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockUpdated, error: null })
            })
          })
        })
      });

      const result = await ItemModel.update('item-1', {
        specifications: {
          land_size: '2000 sq ft',
          land_type: 'Commercial'
        }
      });

      expect(result).toEqual(mockUpdated);
    });

    test('should throw error if update fails', async () => {
      const mockError = new Error('Update failed');

      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: mockError })
            })
          })
        })
      });

      await expect(ItemModel.update('item-1', {})).rejects.toThrow('Update failed');
    });
  });

  describe('delete', () => {
    test('should delete item successfully', async () => {
      const mockDeleted = {
        id: 'item-1',
        auction_id: 'auction-1'
      };

      supabase.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockDeleted, error: null })
            })
          })
        })
      });

      const result = await ItemModel.delete('item-1');

      expect(result).toEqual(mockDeleted);
    });

    test('should throw error if delete fails', async () => {
      const mockError = new Error('Delete failed');

      supabase.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: mockError })
            })
          })
        })
      });

      await expect(ItemModel.delete('item-1')).rejects.toThrow('Delete failed');
    });
  });
});
