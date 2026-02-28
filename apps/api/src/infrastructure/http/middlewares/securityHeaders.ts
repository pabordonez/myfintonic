import helmet from 'helmet'

/**
 * Helmet Middleware.
 * Content Security Policy (CSP).
 *
 * OWASP Reference:
 * - Content Security Policy (CSP)
 * - HTTP Strict Transport Security (HSTS)
 * - X-Frame-Options
 * - X-Content-Type-Options
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      // Default: only allow resources from the same origin
      defaultSrc: ["'self'"],
      // Scripts: Only from the same origin. Blocks inline scripts and eval().
      scriptSrc: ["'self'"],
      // Styles: Allowing 'unsafe-inline' is sometimes necessary for UI libraries, although ideally it should be avoided.
      styleSrc: ["'self'", "'unsafe-inline'"],
      // Images: Same origin and data URIs (base64)
      imgSrc: ["'self'", 'data:', 'https:'],
      // Connections (AJAX/Fetch): Only to the same origin
      connectSrc: ["'self'"],
      // Iframe: Do not allow this site to be embedded (Clickjacking protection)
      frameAncestors: ["'none'"],
      // Objects (Flash, etc.): Totally blocked
      objectSrc: ["'none'"],
    },
  },
  // Allow requests from other origins (necessary for CORS with separate frontend)
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  // HSTS: Force secure connections (1 year)
  hsts:
    process.env.NODE_ENV === 'production'
      ? {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        }
      : false,
  // Hide X-Powered-By header: Express to avoid revealing server technology
  hidePoweredBy: true,
  // Prevent content type sniffing (MIME types)
  noSniff: true,
  // Basic XSS protection for older browsers
  xssFilter: true,
  // Prevent download of open files on the site (IE8+)
  ieNoOpen: true,
})
