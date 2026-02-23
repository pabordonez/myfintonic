// src/infrastructure/http/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  // 1. Zod Validation Errors
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: error.errors,
    })
  }

  // 2. Conflict Errors (Mapped to 409 Conflict)
  if (
    error.message.includes('Email already in use') ||
    error.message.includes('already exists')
  ) {
    return res.status(409).json({ error: error.message })
  }

  // 3. Authentication Errors (Mapped to 401 Unauthorized)
  if (error.message === 'Invalid credentials') {
    return res.status(401).json({ error: error.message })
  }

  // 4. Known Domain Errors (Mapped to 400 Bad Request)
  if (
    error.message.startsWith('Missing required') ||
    error.message.startsWith('Validation failed') ||
    error.message.includes('Financial Entity') ||
    error.message.includes('not allowed') ||
    error.message.includes('Invalid') ||
    error.message.includes('is required')
  ) {
    return res.status(400).json({ error: error.message })
  }

  // 5. Resource Not Found Errors (Mapped to 404 Not Found)
  if (error.message.includes('not found')) {
    return res.status(404).json({ error: error.message })
  }

  // 6. Security/Permission Errors (Mapped to 403 Forbidden)
  if (
    error.message.includes('Unauthorized') ||
    error.message.includes('Forbidden')
  ) {
    return res.status(403).json({ error: error.message })
  }

  // 7. Unexpected Error (500 Internal Server Error)
  console.error(`[Error] ${req.method} ${req.url}:`, error)
  return res.status(500).json({ error: 'Internal Server Error' })
}
