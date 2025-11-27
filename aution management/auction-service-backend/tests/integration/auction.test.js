const request = require('supertest');
const express = require('express');
const auctionRoutes = require('../../src/routes/auctionRoutes');

// Mock the models and validators
jest.mock('../../src/models/auctionModel');
jest.mock('../../src/models/itemModel');
jest.mock('../../src/middlewares/auth');

const AuctionModel = require('../../src/models/auctionModel');
const ItemModel = require('../../src/models/itemModel');
const { checkSeller } = require('../../src/middlewares/auth');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auctions', auctionRoutes);

describe('Auction API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock checkSeller middleware to pass through
    checkSeller.mockImplementation((req, res, next) => next());
  });

  describe('POST /api/auctions - Create Auction', () => {
    test('should create auction successfully with valid data', async () => {
      const mockAuction = {
        id: 'auction-1',
        title: 'Test Auction',
        description: 'This is a test auction with valid description',
        seller_id: 'user-1',
        start_time: '2025-01-01T10:00:00Z',
        end_time: '2025-01-02T10:00:00Z',
        reserve_price: 1000,
        status: 'DRAFT',
        room_code: 'ABC12345'
      };

      AuctionModel.create.mockResolvedValue(mockAuction);

      const response = await request(app)
        .post('/api/auctions')
        .set('x-user-id', 'user-1')
        .send({
          title: 'Test Auction',
          description: 'This is a test auction with valid description',
          start_time: '2025-01-01T10:00:00Z',
          end_time: '2025-01-02T10:00:00Z',
          reserve_price: 1000
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Auction');
    });

    test('should create auction with item', async () => {
      const mockAuction = {
        id: 'auction-1',
        title: 'Land Auction',
        description: 'Residential land for sale in prime location',
        status: 'DRAFT'
      };

      const mockItem = {
        id: 'item-1',
        auction_id: 'auction-1',
        item_type: 'LAND',
        specifications: {
          land_size: '1000 sq ft',
          land_type: 'Residential'
        }
      };

      AuctionModel.create.mockResolvedValue(mockAuction);
      ItemModel.create.mockResolvedValue(mockItem);

      const response = await request(app)
        .post('/api/auctions')
        .set('x-user-id', 'user-1')
        .send({
          title: 'Land Auction',
          description: 'Residential land for sale in prime location',
          start_time: '2025-01-01T10:00:00Z',
          end_time: '2025-01-02T10:00:00Z',
          reserve_price: 50000,
          item: {
            item_type: 'LAND',
            specifications: {
              land_size: '1000 sq ft',
              land_type: 'Residential'
            }
          }
        });

      expect(response.status).toBe(201);
      expect(response.body.auction_items).toBeDefined();
    });

    test('should fail with invalid title', async () => {
      const response = await request(app)
        .post('/api/auctions')
        .set('x-user-id', 'user-1')
        .send({
          title: 'Hi',
          description: 'This is a test auction with valid description',
          start_time: '2025-01-01T10:00:00Z',
          end_time: '2025-01-02T10:00:00Z',
          reserve_price: 1000
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('Title must be at least 5 characters');
    });

    test('should fail with invalid description', async () => {
      const response = await request(app)
        .post('/api/auctions')
        .set('x-user-id', 'user-1')
        .send({
          title: 'Test Auction',
          description: 'Short',
          start_time: '2025-01-01T10:00:00Z',
          end_time: '2025-01-02T10:00:00Z',
          reserve_price: 1000
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('Description must be at least 20 characters');
    });

    test('should fail with invalid reserve price', async () => {
      const response = await request(app)
        .post('/api/auctions')
        .set('x-user-id', 'user-1')
        .send({
          title: 'Test Auction',
          description: 'This is a test auction with valid description',
          start_time: '2025-01-01T10:00:00Z',
          end_time: '2025-01-02T10:00:00Z',
          reserve_price: 0
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('Reserve price must be greater than 0');
    });

    test('should fail with invalid auction duration', async () => {
      const response = await request(app)
        .post('/api/auctions')
        .set('x-user-id', 'user-1')
        .send({
          title: 'Test Auction',
          description: 'This is a test auction with valid description',
          start_time: '2025-01-01T10:00:00Z',
          end_time: '2025-01-01T10:30:00Z',
          reserve_price: 1000
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('Auction must be at least 1 hour long');
    });

    test('should rollback auction if item validation fails', async () => {
      const mockAuction = {
        id: 'auction-1',
        title: 'Test Auction'
      };

      AuctionModel.create.mockResolvedValue(mockAuction);
      AuctionModel.delete.mockResolvedValue({ status: 'CANCELLED' });

      const response = await request(app)
        .post('/api/auctions')
        .set('x-user-id', 'user-1')
        .send({
          title: 'Test Auction',
          description: 'This is a test auction with valid description',
          start_time: '2025-01-01T10:00:00Z',
          end_time: '2025-01-02T10:00:00Z',
          reserve_price: 1000,
          item: {
            item_type: 'INVALID_TYPE',
            specifications: {}
          }
        });

      expect(response.status).toBe(400);
      expect(AuctionModel.delete).toHaveBeenCalledWith('auction-1');
    });
  });

  describe('GET /api/auctions - Get All Auctions', () => {
    test('should get all auctions', async () => {
      const mockAuctions = [
        { id: '1', title: 'Auction 1', status: 'ACTIVE' },
        { id: '2', title: 'Auction 2', status: 'DRAFT' }
      ];

      AuctionModel.getAll.mockResolvedValue(mockAuctions);

      const response = await request(app).get('/api/auctions');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('Auction 1');
    });

    test('should filter auctions by status', async () => {
      const mockAuctions = [
        { id: '1', title: 'Auction 1', status: 'ACTIVE' }
      ];

      AuctionModel.getAll.mockResolvedValue(mockAuctions);

      const response = await request(app).get('/api/auctions?status=ACTIVE');

      expect(response.status).toBe(200);
      expect(AuctionModel.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'ACTIVE' })
      );
    });

    test('should paginate auctions', async () => {
      const mockAuctions = [{ id: '1', title: 'Auction 1' }];

      AuctionModel.getAll.mockResolvedValue(mockAuctions);

      const response = await request(app).get('/api/auctions?page=2&limit=10');

      expect(response.status).toBe(200);
      expect(AuctionModel.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, limit: 10 })
      );
    });
  });

  describe('GET /api/auctions/:id - Get Auction by ID', () => {
    test('should get auction by id', async () => {
      const mockAuction = {
        id: 'auction-1',
        title: 'Test Auction',
        status: 'ACTIVE'
      };

      AuctionModel.getById.mockResolvedValue(mockAuction);

      const response = await request(app).get('/api/auctions/auction-1');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('auction-1');
      expect(response.body.title).toBe('Test Auction');
    });

    test('should return 404 if auction not found', async () => {
      AuctionModel.getById.mockResolvedValue(null);

      const response = await request(app).get('/api/auctions/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Auction not found');
    });
  });

  describe('GET /api/auctions/room/:roomCode - Get by Room Code', () => {
    test('should get auction by room code', async () => {
      const mockAuction = {
        id: 'auction-1',
        room_code: 'ABC12345',
        title: 'Test Auction'
      };

      AuctionModel.getByRoomCode.mockResolvedValue(mockAuction);

      const response = await request(app).get('/api/auctions/room/ABC12345');

      expect(response.status).toBe(200);
      expect(response.body.room_code).toBe('ABC12345');
    });

    test('should return 404 if room not found', async () => {
      AuctionModel.getByRoomCode.mockResolvedValue(null);

      const response = await request(app).get('/api/auctions/room/INVALID');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Auction room not found');
    });
  });

  describe('PUT /api/auctions/:id - Update Auction', () => {
    test('should update auction successfully', async () => {
      const existingAuction = {
        id: 'auction-1',
        seller_id: 'user-1',
        status: 'DRAFT',
        title: 'Old Title',
        description: 'Old description with enough characters',
        start_time: '2025-01-01T10:00:00Z',
        end_time: '2025-01-02T10:00:00Z',
        reserve_price: 1000
      };

      const updatedAuction = {
        ...existingAuction,
        title: 'Updated Title'
      };

      AuctionModel.getById.mockResolvedValue(existingAuction);
      AuctionModel.update.mockResolvedValue(updatedAuction);

      const response = await request(app)
        .put('/api/auctions/auction-1')
        .set('x-user-id', 'user-1')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Title');
    });

    test('should fail if user is not the owner', async () => {
      const existingAuction = {
        id: 'auction-1',
        seller_id: 'user-1',
        status: 'DRAFT'
      };

      AuctionModel.getById.mockResolvedValue(existingAuction);

      const response = await request(app)
        .put('/api/auctions/auction-1')
        .set('x-user-id', 'user-2')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Not authorized');
    });

    test('should fail if auction is not DRAFT', async () => {
      const existingAuction = {
        id: 'auction-1',
        seller_id: 'user-1',
        status: 'ACTIVE'
      };

      AuctionModel.getById.mockResolvedValue(existingAuction);

      const response = await request(app)
        .put('/api/auctions/auction-1')
        .set('x-user-id', 'user-1')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Can only update draft auctions');
    });
  });

  describe('DELETE /api/auctions/:id - Cancel Auction', () => {
    test('should cancel auction successfully', async () => {
      const existingAuction = {
        id: 'auction-1',
        seller_id: 'user-1',
        status: 'DRAFT'
      };

      const cancelledAuction = {
        ...existingAuction,
        status: 'CANCELLED'
      };

      AuctionModel.getById.mockResolvedValue(existingAuction);
      AuctionModel.delete.mockResolvedValue(cancelledAuction);

      const response = await request(app)
        .delete('/api/auctions/auction-1')
        .set('x-user-id', 'user-1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Auction cancelled');
    });

    test('should fail if user is not the owner', async () => {
      const existingAuction = {
        id: 'auction-1',
        seller_id: 'user-1',
        status: 'DRAFT'
      };

      AuctionModel.getById.mockResolvedValue(existingAuction);

      const response = await request(app)
        .delete('/api/auctions/auction-1')
        .set('x-user-id', 'user-2');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Not authorized');
    });
  });

  describe('PUT /api/auctions/:id/status - Update Status', () => {
    test('should update status from DRAFT to ACTIVE', async () => {
      const existingAuction = {
        id: 'auction-1',
        seller_id: 'user-1',
        status: 'DRAFT'
      };

      const updatedAuction = {
        ...existingAuction,
        status: 'ACTIVE'
      };

      AuctionModel.getById.mockResolvedValue(existingAuction);
      AuctionModel.update.mockResolvedValue(updatedAuction);

      const response = await request(app)
        .put('/api/auctions/auction-1/status')
        .set('x-user-id', 'user-1')
        .send({ status: 'ACTIVE' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ACTIVE');
    });

    test('should fail with invalid status transition', async () => {
      const existingAuction = {
        id: 'auction-1',
        seller_id: 'user-1',
        status: 'CLOSED'
      };

      AuctionModel.getById.mockResolvedValue(existingAuction);

      const response = await request(app)
        .put('/api/auctions/auction-1/status')
        .set('x-user-id', 'user-1')
        .send({ status: 'ACTIVE' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Cannot transition from CLOSED to ACTIVE');
    });
  });

  describe('GET /api/auctions/search - Search Auctions', () => {
    test('should search auctions successfully', async () => {
      const mockResults = [
        { id: '1', title: 'Land Auction' },
        { id: '2', title: 'Another Land Sale' }
      ];

      AuctionModel.search.mockResolvedValue(mockResults);

      const response = await request(app).get('/api/auctions/search?q=land');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    test('should fail with short search term', async () => {
      const response = await request(app).get('/api/auctions/search?q=ab');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Search term must be at least 3 characters');
    });
  });

  describe('GET /api/auctions/rooms/active - Get Active Rooms', () => {
    test('should get all active rooms', async () => {
      const mockRooms = [
        { room_code: 'ABC12345', active: true },
        { room_code: 'XYZ98765', active: true }
      ];

      AuctionModel.getActiveRooms.mockResolvedValue(mockRooms);

      const response = await request(app).get('/api/auctions/rooms/active');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('POST /api/auctions/room/:roomCode/join - Join Room', () => {
    test('should join room successfully', async () => {
      const mockAuction = {
        id: 'auction-1',
        room_code: 'ABC12345',
        status: 'ACTIVE',
        auction_rooms: [{ participant_count: 5 }]
      };

      AuctionModel.getByRoomCode.mockResolvedValue(mockAuction);
      AuctionModel.updateRoomParticipants.mockResolvedValue({ participant_count: 6 });

      const response = await request(app).post('/api/auctions/room/ABC12345/join');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Joined room successfully');
      expect(AuctionModel.updateRoomParticipants).toHaveBeenCalledWith('ABC12345', 6);
    });

    test('should fail if room is not active', async () => {
      const mockAuction = {
        id: 'auction-1',
        room_code: 'ABC12345',
        status: 'DRAFT'
      };

      AuctionModel.getByRoomCode.mockResolvedValue(mockAuction);

      const response = await request(app).post('/api/auctions/room/ABC12345/join');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Auction room is not active');
    });
  });
});
