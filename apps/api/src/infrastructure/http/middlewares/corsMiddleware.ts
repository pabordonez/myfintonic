import cors from 'cors'
import { env } from '@infrastructure/config/env'

// Ensure it is an array for exact match, not substrings
const allowedOrigins = (
  Array.isArray(env.CORS_ORIGIN)
    ? env.CORS_ORIGIN
    : (env.CORS_ORIGIN as string).split(',')
).map((origin) => origin.trim())

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl, Postman or server-to-server) only in development
    if (!origin) {
      if (env.NODE_ENV !== 'production') {
        return callback(null, true)
      }
      // In production, block requests without origin
      return callback(new Error('Not allowed by CORS'))
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.error(
        `[CORS ERROR] Origin blocked: '${origin}'. Allowed: ${JSON.stringify(allowedOrigins)}`
      )
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
})
