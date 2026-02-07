import rateLimit from 'express-rate-limit'

/**
 * Rate Limiter específico para Login (Prevención de Fuerza Bruta).
 * Muy estricto: 5 intentos por minuto.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message:
      'Demasiados intentos de inicio de sesión. Por favor, inténtalo de nuevo en 1 minuto.',
  },
})

/**
 * Rate Limiter para Productos (Prevención de Scraping/Enumeration).
 * Más relajado que el login, pero protege contra extracción masiva de datos.
 */
export const productsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 300, // Permite navegación fluida, pero bloquea bots agresivos
  standardHeaders: true,
  legacyHeaders: false,
})
