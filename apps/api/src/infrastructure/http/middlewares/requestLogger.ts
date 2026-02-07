import { Request, Response, NextFunction } from 'express'

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start

    // Sanitización de logs: Evitar loguear contraseñas
    let safeBody = req.body
    if (safeBody && typeof safeBody === 'object' && !Array.isArray(safeBody)) {
      safeBody = { ...safeBody }
      const sensitiveFields = [
        'password',
        'currentPassword',
        'newPassword',
        'token',
      ]
      sensitiveFields.forEach((field) => {
        if (field in safeBody) {
          safeBody[field] = '***'
        }
      })
    }

    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl || req.url} ${res.statusCode} ${duration}ms`,
      {
        body: safeBody,
        query: req.query,
      }
    )
  })

  next()
}
