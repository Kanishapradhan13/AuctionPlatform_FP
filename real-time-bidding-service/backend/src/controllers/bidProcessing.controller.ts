/**
 * PERSON A - BID PROCESSING CONTROLLER
 * 
 * Handles HTTP requests for bid placement and validation
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import bidProcessingService from '../services/bidProcessing.service';
import { placeBidSchema, validateBidAmountSchema } from '../models/validation';
import { ValidationError } from '../middleware/errorHandler';
import logger from '../config/logger';

export class BidProcessingController {
  /**
   * POST /api/bids/place
   * Place a new bid
   */
  placeBid = asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const { error, value } = placeBidSchema.validate(req.body);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { auction_id, bidder_id, amount } = value;

    logger.info('Placing bid:', { auction_id, bidder_id, amount });

    // Process bid placement
    const bid = await bidProcessingService.placeBid({
      auction_id,
      bidder_id,
      amount,
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Bid placed successfully',
      data: bid,
    });
  });

  /**
   * POST /api/bids/validate
   * Validate a bid amount before placement
   */
  validateBid = asyncHandler(async (req: Request, res: Response) => {
    const { error, value } = validateBidAmountSchema.validate(req.body);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { auction_id, amount } = value;
    const bidder_id = req.body.bidder_id || 'anonymous';

    logger.info('Validating bid:', { auction_id, amount });

    const validation = await bidProcessingService.validateBidAmount(
      auction_id,
      amount,
      bidder_id
    );

    res.status(200).json({
      success: true,
      data: validation,
    });
  });

  /**
   * GET /api/bids/highest/:auctionId
   * Get current highest bid for an auction
   */
  getHighestBid = asyncHandler(async (req: Request, res: Response) => {
    const { auctionId } = req.params;

    if (!auctionId) {
      throw new ValidationError('Auction ID is required');
    }

    logger.info('Getting highest bid for auction:', auctionId);

    const highestBid = await bidProcessingService.getHighestBid(auctionId);

    if (!highestBid) {
      return res.status(200).json({
        success: true,
        message: 'No bids found for this auction',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: highestBid,
    });
  });

  /**
   * DELETE /api/bids/cache/:auctionId
   * Invalidate cache for an auction (admin only)
   */
  invalidateCache = asyncHandler(async (req: Request, res: Response) => {
    const { auctionId } = req.params;

    if (!auctionId) {
      throw new ValidationError('Auction ID is required');
    }

    logger.info('Invalidating cache for auction:', auctionId);

    await bidProcessingService.invalidateAuctionCache(auctionId);

    res.status(200).json({
      success: true,
      message: 'Cache invalidated successfully',
    });
  });
}

export default new BidProcessingController();
