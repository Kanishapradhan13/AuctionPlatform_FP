import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import auctionService from '../services/auction.service';

export class AuctionController {
  getActiveAuctions = asyncHandler(async (_req: Request, res: Response) => {
    const auctions = await auctionService.getActiveAuctions();
    
    return res.status(200).json({
      success: true,
      data: auctions
    });
  });

  getAuctionById = asyncHandler(async (req: Request, res: Response) => {
    const { auctionId } = req.params;
    const auction = await auctionService.getAuctionById(auctionId);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: auction
    });
  });
}

export default new AuctionController();
