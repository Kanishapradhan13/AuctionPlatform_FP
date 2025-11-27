const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');
const { checkSeller } = require('../middlewares/auth');

// Public routes
router.get('/', auctionController.getAll);
router.get('/search', auctionController.search);
router.get('/rooms/active', auctionController.getActiveRooms);
router.get('/room/:roomCode', auctionController.getByRoomCode);
router.get('/:id', auctionController.getById);
router.post('/room/:roomCode/join', auctionController.joinRoom);

// Protected routes (require seller verification)
router.post('/', checkSeller, auctionController.create);
router.put('/:id', checkSeller, auctionController.update);
router.delete('/:id', checkSeller, auctionController.delete);
router.put('/:id/status', checkSeller, auctionController.updateStatus);

module.exports = router;
