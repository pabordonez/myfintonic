import { rateLimit } from 'express-rate-limit'
import { env } from '@infrastructure/config/env'

export const rateLimitMiddleware = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true, // `RateLimit-*`
  legacyHeaders: false, // `X-RateLimit-*`
  message: {
    error: 'Too many requests, please try again later.',
  },

  skip: () => env.NODE_ENV === 'test',
  // In production, if we are behind a proxy (Nginx, Cloudflare), Express needs to trust it
  // to read the real IP. This is configured via app.set('trust proxy', 1) in app.ts,
  // but express-rate-limit uses it automatically if Express is configured.
})
