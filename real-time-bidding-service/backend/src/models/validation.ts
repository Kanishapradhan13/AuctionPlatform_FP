import Joi from 'joi';

export const placeBidSchema = Joi.object({
  auction_id: Joi.string().required().messages({
    'any.required': 'Auction ID is required',
  }),
  bidder_id: Joi.string().required().messages({
    'any.required': 'Bidder ID is required',
  }),
  amount: Joi.number().positive().precision(2).required().messages({
    'number.base': 'Bid amount must be a number',
    'number.positive': 'Bid amount must be positive',
    'any.required': 'Bid amount is required',
  }),
});

export const auctionIdSchema = Joi.object({
  auctionId: Joi.string().required().messages({
    'any.required': 'Auction ID is required',
  }),
});

export const validateBidAmountSchema = Joi.object({
  auction_id: Joi.string().required(),
  amount: Joi.number().positive().precision(2).required(),
});