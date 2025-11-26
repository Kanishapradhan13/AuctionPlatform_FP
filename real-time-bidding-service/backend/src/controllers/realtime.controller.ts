/**
 * PERSON B - REALTIME & HISTORY CONTROLLER
 * 
 * Handles HTTP requests for bid history and realtime operations
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import realtimeService from '../services/realtime.service';
import { ValidationError } from '../middleware/errorHandler';
import logger from '../config/logger';

export class RealtimeController {
  /**
   * GET /api/bids/history/:auctionId
   * Get all bids for an auction
   */
  getBidHistory = asyncHandler(async (req: Request, res: Response) => {
    const { auctionId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const paginated = req.query.paginated === 'true';

    if (!auctionId) {
      throw new ValidationError('Auction ID is required');
    }

    logger.info('Getting bid history for auction:', auctionId);

    if (paginated) {
      const result = await realtimeService.getBidHistoryPaginated(
        auctionId,
        page,
        limit
      );

      return res.status(200).json({
        success: true,
        data: result.bids,
        pagination: {
          page: result.page,
          total: result.total,
          totalPages: result.totalPages,
          limit,
        },
      });
    }

    const bids = await realtimeService.getBidHistory(auctionId);

    return res.status(200).json({
      success: true,
      data: bids,
      count: bids.length,
    });
  });

  /**
   * GET /api/bids/audit/:auctionId
   * Get full audit history for an auction
   */
  getAuditHistory = asyncHandler(async (req: Request, res: Response) => {
    const { auctionId } = req.params;

    if (!auctionId) {
      throw new ValidationError('Auction ID is required');
    }

    logger.info('Getting audit history for auction:', auctionId);

    const history = await realtimeService.getAuditHistory(auctionId);

    res.status(200).json({
      success: true,
      data: history,
      count: history.length,
    });
  });

  /**
   * GET /api/bids/statistics/:auctionId
   * Get bid statistics for an auction
   */
  getBidStatistics = asyncHandler(async (req: Request, res: Response) => {
    const { auctionId } = req.params;

    if (!auctionId) {
      throw new ValidationError('Auction ID is required');
    }

    logger.info('Getting bid statistics for auction:', auctionId);

    const stats = await realtimeService.getBidStatistics(auctionId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  });

  /**
   * POST /api/bids/realtime/setup/:auctionId
   * Setup Realtime channel for an auction
   */
  setupRealtimeChannel = asyncHandler(async (req: Request, res: Response) => {
    const { auctionId } = req.params;

    if (!auctionId) {
      throw new ValidationError('Auction ID is required');
    }

    logger.info('Setting up Realtime channel for auction:', auctionId);

    res.status(200).json({
      success: true,
      message: 'Realtime channel setup successfully',
      data: {
        channel_name: `auction:${auctionId}:bids`,
        status: 'active',
      },
    });
  });

  /**
   * DELETE /api/bids/realtime/close/:auctionId
   * Close Realtime channel for an auction
   */
  closeRealtimeChannel = asyncHandler(async (req: Request, res: Response) => {
    const { auctionId } = req.params;

    if (!auctionId) {
      throw new ValidationError('Auction ID is required');
    }

    logger.info('Closing Realtime channel for auction:', auctionId);

    realtimeService.closeRealtimeChannel(auctionId);

    res.status(200).json({
      success: true,
      message: 'Realtime channel closed successfully',
    });
  });

  /**
   * GET /api/bids/realtime/channels
   * Get all active Realtime channels
   */
  getActiveChannels = asyncHandler(async (_req: Request, res: Response) => {
    logger.info('Getting active Realtime channels');

    const channels = realtimeService.getActiveChannels();

    res.status(200).json({
      success: true,
      data: channels,
      count: channels.length,
    });
  });

  /**
   * GET /api/bids/recent
   * Get recent bids across all auctions
   */
  getRecentBids = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;

    logger.info('Getting recent bids, limit:', limit);

    const bids = await realtimeService.getRecentBids(limit);

    res.status(200).json({
      success: true,
      data: bids,
      count: bids.length,
    });
  });

  /**
   * GET /api/bids/user/:userId
   * Get user's bid history
   */
  getUserBidHistory = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    logger.info('Getting bid history for user:', userId);

    const bids = await realtimeService.getUserBidHistory(userId, limit);

    res.status(200).json({
      success: true,
      data: bids,
      count: bids.length,
    });
  });

  /**
   * GET /api/bids/user/:userId/winning
   * Get user's winning bids
   */
  getUserWinningBids = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    logger.info('Getting winning bids for user:', userId);

    const bids = await realtimeService.getUserWinningBids(userId);

    res.status(200).json({
      success: true,
      data: bids,
      count: bids.length,
    });
  });
}

export default new RealtimeController();
