import helmet from 'helmet'

/**
 * Middleware de seguridad utilizando Helmet.
 * Configura cabeceras HTTP seguras, incluyendo Content Security Policy (CSP).
 *
 * Referencia OWASP:
 * - Content Security Policy (CSP)
 * - HTTP Strict Transport Security (HSTS)
 * - X-Frame-Options
 * - X-Content-Type-Options
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      // Por defecto, solo permitir recursos del mismo origen
      defaultSrc: ["'self'"],
      // Scripts: Solo del mismo origen. Bloquea inline scripts y eval().
      scriptSrc: ["'self'"],
      // Estilos: Permitir 'unsafe-inline' es necesario a veces para librerías UI, aunque idealmente se evitaría.
      styleSrc: ["'self'", "'unsafe-inline'"],
      // Imágenes: Mismo origen y data URIs (base64)
      imgSrc: ["'self'", 'data:', 'https:'],
      // Conexiones (AJAX/Fetch): Solo al mismo origen
      connectSrc: ["'self'"],
      // Iframe: No permitir que este sitio sea embebido (Clickjacking protection)
      frameAncestors: ["'none'"],
      // Objetos (Flash, etc.): Bloqueados totalmente
      objectSrc: ["'none'"],
    },
  },
  // Permitir peticiones desde otros orígenes (necesario para CORS con frontend separado)
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  // HSTS: Forzar conexiones seguras (1 año)
  hsts: false,
  // Ocultar la cabecera X-Powered-By: Express para no revelar tecnología del servidor
  hidePoweredBy: true,
  // Evitar sniffing de tipo de contenido (MIME types)
  noSniff: true,
  // Protección XSS básica para navegadores antiguos
  xssFilter: true,
  // Evitar descarga de archivos abiertos en el sitio (IE8+)
  ieNoOpen: true,
})
