import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '@config/env'
import { Role } from '@domain/types'

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const parts = authHeader.split(' ')

  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Token error' })
  }

  const [scheme, token] = parts

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token malformatted' })
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; role: Role }
    ;(req as any).user = decoded
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
