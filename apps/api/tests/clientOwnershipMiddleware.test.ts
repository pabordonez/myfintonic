import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import { clientOwnershipMiddleware } from '../src/infrastructure/http/middlewares/clientOwnershipMiddleware'

describe('clientOwnershipMiddleware', () => {
  let req: any
  let res: Partial<Response>
  let next: NextFunction

  beforeEach(() => {
    req = {
      params: {},
      user: undefined
    }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    }
    next = vi.fn()
  })

  it('should call next if user is ADMIN', () => {
    req.user = { id: 'admin', role: 'ADMIN' } as any
    req.params = { clientId: 'other' }
    
    clientOwnershipMiddleware(req as Request, res as Response, next)
    expect(next).toHaveBeenCalled()
  })

  it('should call next if user owns the resource', () => {
    req.user = { id: 'u1', role: 'USER' } as any
    req.params = { clientId: 'u1' }

    clientOwnershipMiddleware(req as Request, res as Response, next)
    expect(next).toHaveBeenCalled()
  })

  it('should return 403 if user does not own resource and is not ADMIN', () => {
    req.user = { id: 'u1', role: 'USER' } as any
    req.params = { clientId: 'u2' }

    clientOwnershipMiddleware(req as Request, res as Response, next)
    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden: You can only access your own resources' })
  })
})