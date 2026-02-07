import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '@config/env'
import { Role } from '@domain/types'

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string
      role: Role
    }
    ;(req as any).user = decoded
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
