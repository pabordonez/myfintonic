import rateLimit from 'express-rate-limit'
import { env } from '@infrastructure/config/env'

/**
 * Specific Rate Limiter for Login (Brute Force Prevention).
 * Very strict: 5 attempts per minute.
 */
export const loginRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_LOGIN_WINDOW_MS,
  limit: env.RATE_LIMIT_LOGIN_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many login attempts. Please try again later.',
  },
})
