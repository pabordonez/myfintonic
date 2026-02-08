import cors from 'cors'
import { env } from '@config/env'

// Aseguramos que sea un array para coincidencia exacta, no de subcadenas
const allowedOrigins = Array.isArray(env.CORS_ORIGIN)
  ? env.CORS_ORIGIN
  : (env.CORS_ORIGIN as string).split(',').map((origin) => origin.trim())

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (como curl, Postman o server-to-server)
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
