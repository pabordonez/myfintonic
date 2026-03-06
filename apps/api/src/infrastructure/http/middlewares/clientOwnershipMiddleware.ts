import { Request, Response, NextFunction } from 'express'

/**
 * Verifies that the authenticated user matches the route's clientId.
 * Example: /clients/:clientId/financial-entities
 */
export const clientOwnershipMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Admin Bypass
  if (req.user?.role === 'ADMIN') {
    next()
    return
  }

  const routeClientId = req.params.clientId || req.params.id

  if (!routeClientId || routeClientId !== req.user?.id) {
    res
      .status(403)
      .json({ error: 'Forbidden: You can only access your own resources' })
    return
  }

  next()
}
