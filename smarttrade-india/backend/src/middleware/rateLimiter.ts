import rateLimit from 'express-rate-limit';
import { config } from '../config';

export const globalRateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many login attempts' } },
});

export const orderRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Order rate limit exceeded' } },
});
