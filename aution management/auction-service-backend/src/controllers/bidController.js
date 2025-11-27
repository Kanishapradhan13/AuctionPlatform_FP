const AuctionModel = require('../models/auctionModel');

class BidController {
  // Place a bid
  async placeBid(req, res) {
    try {
      const { auctionId } = req.params;
      const { amount } = req.body;
      const userId = req.headers['x-user-id'];

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid bid amount' });
      }

      // Get auction
      const auction = await AuctionModel.getById(auctionId);
      if (!auction) {
        return res.status(404).json({ error: 'Auction not found' });
      }

      // Check if auction is active
      if (auction.status !== 'ACTIVE') {
        return res.status(400).json({ error: 'Auction is not active' });
      }

      // Check if bid is higher than current highest bid
      if (amount <= auction.current_highest_bid) {
        return res.status(400).json({
          error: `Bid must be higher than current bid of Nu ${auction.current_highest_bid}`
        });
      }

      // Check if bid meets reserve price
      if (auction.current_highest_bid === 0 && amount < auction.reserve_price) {
        return res.status(400).json({
          error: `Bid must meet reserve price of Nu ${auction.reserve_price}`
        });
      }

      // Update auction with new highest bid
      const updated = await AuctionModel.update(auctionId, {
        current_highest_bid: amount,
        winner_id: userId
      });

      res.json({
        message: 'Bid placed successfully',
        auction: updated,
        bid: {
          amount,
          bidder_id: userId,
          placed_at: new Date()
        }
      });
    } catch (error) {
      console.error('Place bid error:', error);
      res.status(500).json({ error: 'Failed to place bid' });
    }
  }

  // Place bid by room code
  async placeBidByRoomCode(req, res) {
    try {
      const { roomCode } = req.params;
      const { amount } = req.body;
      const userId = req.headers['x-user-id'];

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid bid amount' });
      }

      // Get auction by room code
      const auction = await AuctionModel.getByRoomCode(roomCode);
      if (!auction) {
        return res.status(404).json({ error: 'Auction room not found' });
      }

      // Check if auction is active
      if (auction.status !== 'ACTIVE') {
        return res.status(400).json({ error: 'Auction is not active' });
      }

      // Check if bid is higher than current highest bid
      if (amount <= auction.current_highest_bid) {
        return res.status(400).json({
          error: `Bid must be higher than current bid of Nu ${auction.current_highest_bid}`
        });
      }

      // Check if bid meets reserve price
      if (auction.current_highest_bid === 0 && amount < auction.reserve_price) {
        return res.status(400).json({
          error: `Bid must meet reserve price of Nu ${auction.reserve_price}`
        });
      }

      // Update auction with new highest bid
      const updated = await AuctionModel.update(auction.id, {
        current_highest_bid: amount,
        winner_id: userId
      });

      res.json({
        message: 'Bid placed successfully',
        auction: updated,
        bid: {
          amount,
          bidder_id: userId,
          placed_at: new Date()
        }
      });
    } catch (error) {
      console.error('Place bid error:', error);
      res.status(500).json({ error: 'Failed to place bid' });
    }
  }

  // Get current bid info
  async getCurrentBid(req, res) {
    try {
      const { auctionId } = req.params;

      const auction = await AuctionModel.getById(auctionId);
      if (!auction) {
        return res.status(404).json({ error: 'Auction not found' });
      }

      res.json({
        auction_id: auction.id,
        current_highest_bid: auction.current_highest_bid,
        winner_id: auction.winner_id,
        reserve_price: auction.reserve_price,
        status: auction.status
      });
    } catch (error) {
      console.error('Get current bid error:', error);
      res.status(500).json({ error: 'Failed to fetch bid information' });
    }
  }
}

module.exports = new BidController();
