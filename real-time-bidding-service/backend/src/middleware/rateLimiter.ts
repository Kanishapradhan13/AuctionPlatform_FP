import rateLimit from 'express-rate-limit';
import { rateLimitConfig } from '../config';

// General rate limiter for bid placement
export const bidPlacementLimiter = rateLimit({
  windowMs: rateLimitConfig.windowMs, // 1 minute
  max: rateLimitConfig.maxRequests, // 10 requests per minute
  message: {
    success: false,
    error: 'Too many bid attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use user ID from request if available
  keyGenerator: (req) => {
    return req.body?.bidder_id || req.ip || 'unknown';
  },
});

// Rate limiter for history endpoints (more lenient)
export const historyLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 30, // 30 requests per minute
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for validation checks
export const validationLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 20, // 20 requests per minute
  message: {
    success: false,
    error: 'Too many validation requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
