// Shared types for Real-Time Bidding Service

export interface Bid {
  bid_id: string;
  auction_id: string;
  bidder_id: string;
  amount: number;
  bid_time: Date;
  is_winning: boolean;
  created_at: Date;
}

export interface BidInput {
  auction_id: string;
  bidder_id: string;
  amount: number;
}

export interface BidValidationResult {
  valid: boolean;
  message?: string;
  current_highest_bid?: number;
}

export interface HighestBid {
  bid_id: string;
  amount: number;
  bidder_id: string;
  bid_time: Date;
}

export interface BidHistory {
  history_id: string;
  auction_id: string;
  bid_data: Bid;
  event_type: string;
  created_at: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface RealtimeBidEvent {
  type: 'NEW_BID' | 'OUTBID' | 'AUCTION_END';
  bid: Bid;
  auction_id: string;
  timestamp: Date;
}

export enum BidStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  OUTBID = 'OUTBID'
}

export interface AuctionStatus {
  auction_id: string;
  is_active: boolean;
  end_time: Date;
  current_highest_bid: number;
  bid_count: number;
}

// Mock service response types
export interface UserServiceResponse {
  user_id: string;
  is_authenticated: boolean;
  is_verified: boolean;
}

export interface AuctionServiceResponse {
  auction_id: string;
  is_active: boolean;
  reserve_price: number;
  current_bid: number;
  end_time: string;
}

// Error types
export class BidError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'BidError';
  }
}

export class ValidationError extends BidError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class AuctionError extends BidError {
  constructor(message: string) {
    super(message, 'AUCTION_ERROR', 404);
    this.name = 'AuctionError';
  }
}

export class AuthenticationError extends BidError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}
