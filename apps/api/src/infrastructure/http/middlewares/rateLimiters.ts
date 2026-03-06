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

/**
 * Rate Limiter for Products (Scraping/Enumeration Prevention).
 * More relaxed than login, but protects against massive data extraction.
 */
export const productsRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_PRODUCTS_WINDOW_MS,
  limit: env.RATE_LIMIT_PRODUCTS_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
})
