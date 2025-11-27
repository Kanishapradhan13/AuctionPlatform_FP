import axios from 'axios';
import { Auction, CreateAuctionRequest } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
const USER_ID = process.env.NEXT_PUBLIC_USER_ID || 'test-user-123';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': USER_ID,
  },
});

export const auctionAPI = {
  // Get all auctions
  getAll: async (filters?: any) => {
    const { data } = await api.get('/api/auctions', { params: filters });
    return data;
  },

  // Get single auction
  getById: async (id: string) => {
    const { data } = await api.get(`/api/auctions/${id}`);
    return data;
  },

  // Get auction by room code
  getByRoomCode: async (roomCode: string) => {
    const { data } = await api.get(`/api/auctions/room/${roomCode}`);
    return data;
  },

  // Create auction
  create: async (auctionData: CreateAuctionRequest) => {
    const { data } = await api.post('/api/auctions', auctionData);
    return data;
  },

  // Update auction
  update: async (id: string, updates: Partial<Auction>) => {
    const { data } = await api.put(`/api/auctions/${id}`, updates);
    return data;
  },

  // Delete auction
  delete: async (id: string) => {
    const { data } = await api.delete(`/api/auctions/${id}`);
    return data;
  },

  // Change status
  updateStatus: async (id: string, status: string) => {
    const { data } = await api.put(`/api/auctions/${id}/status`, { status });
    return data;
  },

  // Search auctions
  search: async (query: string) => {
    const { data } = await api.get('/api/auctions/search', { params: { q: query } });
    return data;
  },

  // Get active rooms
  getActiveRooms: async () => {
    const { data } = await api.get('/api/auctions/rooms/active');
    return data;
  },

  // Join room
  joinRoom: async (roomCode: string) => {
    const { data } = await api.post(`/api/auctions/room/${roomCode}/join`);
    return data;
  },
};

export const bidAPI = {
  // Place bid by room code
  placeBidByRoomCode: async (roomCode: string, amount: number) => {
    const { data } = await api.post(`/api/bids/room/${roomCode}`, { amount });
    return data;
  },

  // Place bid by auction ID
  placeBid: async (auctionId: string, amount: number) => {
    const { data } = await api.post(`/api/bids/auction/${auctionId}`, { amount });
    return data;
  },

  // Get current bid info
  getCurrentBid: async (auctionId: string) => {
    const { data } = await api.get(`/api/bids/auction/${auctionId}/current`);
    return data;
  },
};

export default api;
