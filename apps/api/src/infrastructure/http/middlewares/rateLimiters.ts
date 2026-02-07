import rateLimit from 'express-rate-limit'
import { env } from '@config/env'

/**
 * Rate Limiter específico para Login (Prevención de Fuerza Bruta).
 * Muy estricto: 5 intentos por minuto.
 */
export const loginRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_LOGIN_WINDOW_MS,
  limit: env.RATE_LIMIT_LOGIN_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message:
      'Demasiados intentos de inicio de sesión. Por favor, inténtalo de nuevo más tarde.',
  },
})

/**
 * Rate Limiter para Productos (Prevención de Scraping/Enumeration).
 * Más relajado que el login, pero protege contra extracción masiva de datos.
 */
export const productsRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_PRODUCTS_WINDOW_MS,
  limit: env.RATE_LIMIT_PRODUCTS_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
})
