const AuctionModel = require('../models/auctionModel');
const ItemModel = require('../models/itemModel');
const { validateAuction, validateItem } = require('../utils/validators');

class AuctionController {
  // Create auction with room
  async create(req, res) {
    try {
      const auctionData = {
        seller_id: req.headers['x-user-id'],
        title: req.body.title,
        description: req.body.description,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        reserve_price: req.body.reserve_price,
        status: 'DRAFT'
      };

      // Validate auction data
      const errors = validateAuction(auctionData);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Create auction (this also creates the room)
      const auction = await AuctionModel.create(auctionData);

      // Create item if provided
      if (req.body.item) {
        const itemData = {
          auction_id: auction.id,
          ...req.body.item
        };

        const itemErrors = validateItem(itemData);
        if (itemErrors.length > 0) {
          // Rollback auction creation
          await AuctionModel.delete(auction.id);
          return res.status(400).json({ errors: itemErrors });
        }

        const item = await ItemModel.create(itemData);
        auction.auction_items = [item];
      }

      res.status(201).json(auction);
    } catch (error) {
      console.error('Create auction error:', error);
      res.status(500).json({ error: 'Failed to create auction' });
    }
  }

  // Get all auctions
  async getAll(req, res) {
    try {
      const filters = {
        status: req.query.status,
        seller_id: req.query.seller_id,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const auctions = await AuctionModel.getAll(filters);
      res.json(auctions);
    } catch (error) {
      console.error('Get auctions error:', error);
      res.status(500).json({ error: 'Failed to fetch auctions' });
    }
  }

  // Get single auction
  async getById(req, res) {
    try {
      const auction = await AuctionModel.getById(req.params.id);

      if (!auction) {
        return res.status(404).json({ error: 'Auction not found' });
      }

      res.json(auction);
    } catch (error) {
      console.error('Get auction error:', error);
      res.status(500).json({ error: 'Failed to fetch auction' });
    }
  }

  // Get auction by room code
  async getByRoomCode(req, res) {
    try {
      const auction = await AuctionModel.getByRoomCode(req.params.roomCode);

      if (!auction) {
        return res.status(404).json({ error: 'Auction room not found' });
      }

      res.json(auction);
    } catch (error) {
      console.error('Get auction by room code error:', error);
      res.status(500).json({ error: 'Failed to fetch auction room' });
    }
  }

  // Update auction
  async update(req, res) {
    try {
      const auctionId = req.params.id;
      const userId = req.headers['x-user-id'];

      // Check ownership
      const existing = await AuctionModel.getById(auctionId);
      if (!existing) {
        return res.status(404).json({ error: 'Auction not found' });
      }

      if (existing.seller_id !== userId) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      if (existing.status !== 'DRAFT') {
        return res.status(400).json({ error: 'Can only update draft auctions' });
      }

      // Validate updates
      const errors = validateAuction({ ...existing, ...req.body });
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const updated = await AuctionModel.update(auctionId, req.body);
      res.json(updated);
    } catch (error) {
      console.error('Update auction error:', error);
      res.status(500).json({ error: 'Failed to update auction' });
    }
  }

  // Delete/Cancel auction
  async delete(req, res) {
    try {
      const auctionId = req.params.id;
      const userId = req.headers['x-user-id'];

      // Check ownership
      const existing = await AuctionModel.getById(auctionId);
      if (!existing) {
        return res.status(404).json({ error: 'Auction not found' });
      }

      if (existing.seller_id !== userId) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const cancelled = await AuctionModel.delete(auctionId);
      res.json({ message: 'Auction cancelled', auction: cancelled });
    } catch (error) {
      console.error('Delete auction error:', error);
      res.status(500).json({ error: 'Failed to cancel auction' });
    }
  }

  // Change status
  async updateStatus(req, res) {
    try {
      const auctionId = req.params.id;
      const newStatus = req.body.status;
      const userId = req.headers['x-user-id'];

      // Valid transitions
      const validTransitions = {
        'DRAFT': ['ACTIVE', 'CANCELLED'],
        'ACTIVE': ['CLOSED', 'CANCELLED'],
        'CLOSED': [],
        'CANCELLED': []
      };

      const existing = await AuctionModel.getById(auctionId);
      if (!existing) {
        return res.status(404).json({ error: 'Auction not found' });
      }

      if (existing.seller_id !== userId) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      if (!validTransitions[existing.status].includes(newStatus)) {
        return res.status(400).json({
          error: `Cannot transition from ${existing.status} to ${newStatus}`
        });
      }

      const updated = await AuctionModel.update(auctionId, { status: newStatus });
      res.json(updated);
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ error: 'Failed to update status' });
    }
  }

  // Search auctions
  async search(req, res) {
    try {
      const searchTerm = req.query.q;

      if (!searchTerm || searchTerm.trim().length < 3) {
        return res.status(400).json({ error: 'Search term must be at least 3 characters' });
      }

      const results = await AuctionModel.search(searchTerm);
      res.json(results);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  }

  // Get active rooms
  async getActiveRooms(req, res) {
    try {
      const rooms = await AuctionModel.getActiveRooms();
      res.json(rooms);
    } catch (error) {
      console.error('Get active rooms error:', error);
      res.status(500).json({ error: 'Failed to fetch active rooms' });
    }
  }

  // Join auction room
  async joinRoom(req, res) {
    try {
      const { roomCode } = req.params;
      const auction = await AuctionModel.getByRoomCode(roomCode);

      if (!auction) {
        return res.status(404).json({ error: 'Auction room not found' });
      }

      if (auction.status !== 'ACTIVE') {
        return res.status(400).json({ error: 'Auction room is not active' });
      }

      // Increment participant count
      const currentCount = auction.auction_rooms[0]?.participant_count || 0;
      await AuctionModel.updateRoomParticipants(roomCode, currentCount + 1);

      res.json({ message: 'Joined room successfully', auction });
    } catch (error) {
      console.error('Join room error:', error);
      res.status(500).json({ error: 'Failed to join room' });
    }
  }
}

module.exports = new AuctionController();
