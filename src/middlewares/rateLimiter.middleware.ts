//* rateLimiter
import rateLimit from 'express-rate-limit';
import { env } from '#config/env.config.js';

// front gate api rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  skip: () => env.NODE_ENV === 'test',
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

// Rate limiter for Auth routes
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hr
  max: 5,
  skip: () => env.NODE_ENV === 'test',
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after an hour',
  },
});
