import { Request, Response, NextFunction } from 'express'

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  next()
}
