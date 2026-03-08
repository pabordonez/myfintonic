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
    // Allow requests with no origin (like curl, Postman, mobile apps or Render health checks)
    if (!origin) {
      return callback(null, true)
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
