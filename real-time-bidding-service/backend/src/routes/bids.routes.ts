import { Router } from 'express';
import bidProcessingController from '../controllers/bidProcessing.controller';
import realtimeController from '../controllers/realtime.controller';
import {
  bidPlacementLimiter,
  historyLimiter,
  validationLimiter,
} from '../middleware/rateLimiter';

const router = Router();

// ============================================
// PERSON A ROUTES - Bid Processing
// ============================================

/**
 * POST /api/bids/place
 * Place a new bid
 */
router.post('/place', bidPlacementLimiter, bidProcessingController.placeBid);

/**
 * POST /api/bids/validate
 * Validate a bid amount
 */
router.post('/validate', validationLimiter, bidProcessingController.validateBid);

/**
 * GET /api/bids/highest/:auctionId
 * Get highest bid for an auction
 */
router.get('/highest/:auctionId', bidProcessingController.getHighestBid);

/**
 * DELETE /api/bids/cache/:auctionId
 * Invalidate cache (admin only - add auth middleware in production)
 */
router.delete('/cache/:auctionId', bidProcessingController.invalidateCache);

// ============================================
// PERSON B ROUTES - Realtime & History
// ============================================

/**
 * GET /api/bids/history/:auctionId
 * Get bid history for an auction
 * Query params: paginated=true, page=1, limit=20
 */
router.get('/history/:auctionId', historyLimiter, realtimeController.getBidHistory);

/**
 * GET /api/bids/audit/:auctionId
 * Get full audit history
 */
router.get('/audit/:auctionId', historyLimiter, realtimeController.getAuditHistory);

/**
 * GET /api/bids/statistics/:auctionId
 * Get bid statistics
 */
router.get('/statistics/:auctionId', realtimeController.getBidStatistics);

/**
 * POST /api/bids/realtime/setup/:auctionId
 * Setup Realtime channel
 */
router.post('/realtime/setup/:auctionId', realtimeController.setupRealtimeChannel);

/**
 * DELETE /api/bids/realtime/close/:auctionId
 * Close Realtime channel
 */
router.delete('/realtime/close/:auctionId', realtimeController.closeRealtimeChannel);

/**
 * GET /api/bids/realtime/channels
 * Get active channels
 */
router.get('/realtime/channels', realtimeController.getActiveChannels);

/**
 * GET /api/bids/recent
 * Get recent bids
 * Query params: limit=10
 */
router.get('/recent', realtimeController.getRecentBids);

/**
 * GET /api/bids/user/:userId
 * Get user's bid history
 * Query params: limit=50
 */
router.get('/user/:userId', realtimeController.getUserBidHistory);

/**
 * GET /api/bids/user/:userId/winning
 * Get user's winning bids
 */
router.get('/user/:userId/winning', realtimeController.getUserWinningBids);

export default router;
