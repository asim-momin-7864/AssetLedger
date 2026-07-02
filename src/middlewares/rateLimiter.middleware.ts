//* rateLimiter
import rateLimit from 'express-rate-limit';

// front gate api rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
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
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after an hour',
  },
});
