import { rateLimit } from 'express-rate-limit'
import { env } from '@config/env'

export const rateLimitMiddleware = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true, // Devuelve info en las cabeceras `RateLimit-*`
  legacyHeaders: false, // Deshabilita las cabeceras `X-RateLimit-*`
  message: {
    error: 'Too many requests, please try again later.',
  },
  // En entorno de test, deshabilitamos el límite para no romper las pruebas de integración
  // o si necesitamos hacer muchas peticiones seguidas en los tests.
  skip: () => env.NODE_ENV === 'test',
  // En producción, si estamos detrás de un proxy (Nginx, Cloudflare), Express necesita confiar en él
  // para leer la IP real. Esto se configura en app.set('trust proxy', 1) en app.ts,
  // pero express-rate-limit lo usa automáticamente si Express está configurado.
})