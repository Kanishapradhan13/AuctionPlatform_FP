const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');

// Place bid on auction by ID
router.post('/auction/:auctionId', bidController.placeBid);

// Place bid by room code
router.post('/room/:roomCode', bidController.placeBidByRoomCode);

// Get current bid info
router.get('/auction/:auctionId/current', bidController.getCurrentBid);

module.exports = router;
