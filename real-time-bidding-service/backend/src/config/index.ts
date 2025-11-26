import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createClient as createRedisClient, RedisClientType } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Supabase Configuration
export const supabaseConfig = {
  url: process.env.SUPABASE_URL || '',
  key: process.env.SUPABASE_KEY || '',
  anonKey: process.env.SUPABASE_ANON_KEY || '',
};

// Redis Configuration
export const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
};

// Server Configuration
export const serverConfig = {
  port: parseInt(process.env.PORT || '3003'),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:4003'],
};

// Service URLs
export const serviceUrls = {
  userService: process.env.USER_SERVICE_URL || 'http://localhost:3001',
  auctionService: process.env.AUCTION_SERVICE_URL || 'http://localhost:3002',
  notificationService: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004',
};

// Rate Limiting
export const rateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10'),
};

// Cache TTL
export const cacheTTL = {
  bid: parseInt(process.env.BID_CACHE_TTL || '300'),
  auction: parseInt(process.env.AUCTION_CACHE_TTL || '600'),
};

// Initialize Supabase Client
let supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseConfig.url, supabaseConfig.key, {
      auth: {
        persistSession: false,
      },
    });
  }
  return supabaseClient;
};

// Initialize Redis Client
let redisClient: RedisClientType | null = null;

export const getRedisClient = async (): Promise<RedisClientType> => {
  if (!redisClient) {
    redisClient = createRedisClient({
      url: redisConfig.url,
    }) as RedisClientType;

    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    redisClient.on('connect', () => console.log('Redis Client Connected'));

    await redisClient.connect();
  }
  return redisClient;
};

// Graceful shutdown
export const closeConnections = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
  }
};
