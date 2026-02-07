import cors from 'cors'
import { env } from '@config/env'

const allowedOrigins = env.CORS_ORIGIN

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (como curl, Postman o server-to-server)
    if (!origin) {
      if (env.NODE_ENV !== 'production') return callback(null, true)
      return callback(new Error('Not allowed by CORS'))
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
})
