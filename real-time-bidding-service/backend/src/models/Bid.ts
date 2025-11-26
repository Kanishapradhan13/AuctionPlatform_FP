export interface Bid {
  bid_id: string;
  auction_id: string;
  bidder_id: string;
  amount: number;
  bid_time: Date;
  is_winning: boolean;
  created_at: Date;
}

export interface CreateBidInput {
  auction_id: string;
  bidder_id: string;
  amount: number;
}

export interface BidValidation {
  valid: boolean;
  message?: string;
  current_highest_bid?: number;
  reserve_price?: number;
}

export interface HighestBid {
  bid_id: string;
  amount: number;
  bidder_id: string;
  bid_time: Date;
}

export class BidModel {
  bid_id: string;
  auction_id: string;
  bidder_id: string;
  amount: number;
  bid_time: Date;
  is_winning: boolean;
  created_at: Date;

  constructor(data: Bid) {
    this.bid_id = data.bid_id;
    this.auction_id = data.auction_id;
    this.bidder_id = data.bidder_id;
    this.amount = data.amount;
    this.bid_time = data.bid_time;
    this.is_winning = data.is_winning;
    this.created_at = data.created_at;
  }

  toJSON(): Bid {
    return {
      bid_id: this.bid_id,
      auction_id: this.auction_id,
      bidder_id: this.bidder_id,
      amount: this.amount,
      bid_time: this.bid_time,
      is_winning: this.is_winning,
      created_at: this.created_at,
    };
  }
}

export interface BidHistory {
  history_id: string;
  auction_id: string;
  bid_data: Bid;
  event_type: string;
  created_at: Date;
}

export interface RealtimeBidEvent {
  type: 'NEW_BID' | 'OUTBID' | 'WINNING_BID' | 'AUCTION_END';
  bid: Bid;
  auction_id: string;
  timestamp: Date;
}
