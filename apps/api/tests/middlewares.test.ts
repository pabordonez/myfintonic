import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { authenticate } from '../src/infrastructure/http/middlewares/authenticate'
import { isAdmin } from '../src/infrastructure/http/middlewares/isAdmin'
import { env } from '../src/config/env'

vi.mock('jsonwebtoken')

describe('Middlewares', () => {
  let req: any
  let res: any
  let next: NextFunction

  beforeEach(() => {
    req = {
      headers: {},
      user: undefined,
      header: vi.fn((name: string) => req.headers ? req.headers[name.toLowerCase()] : undefined),
    } as any

    // Creamos el objeto mock primero para asegurar que las referencias sean circulares y correctas
    const resMock: any = {
      status: vi.fn(),
      json: vi.fn(),
      send: vi.fn(),
      sendStatus: vi.fn(),
    }
    // Configuramos el encadenamiento (chaining)
    resMock.status.mockReturnValue(resMock)
    resMock.json.mockReturnValue(resMock)
    resMock.send.mockReturnValue(resMock)
    
    res = resMock

    next = vi.fn()
    vi.clearAllMocks()
  })

  describe('authenticate', () => {
    it('should call next if token is valid', () => {
      req.headers = { authorization: 'Bearer valid-token' }
      vi.mocked(jwt.verify).mockReturnValue({ id: '1', role: 'USER' } as any)

      authenticate(req as Request, res as Response, next)

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', env.JWT_SECRET)
      expect((req as any).user).toEqual({ id: '1', role: 'USER' })
      expect(next).toHaveBeenCalled()
    })

    it('should return 401 if no authorization header', () => {
      req.headers = {}
      authenticate(req as Request, res as Response, next)
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' })
    })

    it('should return 401 if header format is invalid', () => {
      req.headers = { authorization: 'InvalidFormat' }
      authenticate(req as Request, res as Response, next)
      expect(res.status).toHaveBeenCalledWith(401)
    })

    it('should return 401 if token is invalid', () => {
      req.headers = { authorization: 'Bearer invalid-token' }
      vi.mocked(jwt.verify).mockImplementation(() => { throw new Error('Invalid token') })

      authenticate(req as Request, res as Response, next)
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' })
    })
  })

  describe('isAdmin', () => {
    it('should call next if user is ADMIN', async () => {
      req.user = { role: 'ADMIN' } as any
      await isAdmin(req as Request, res as Response, next)
      expect(next).toHaveBeenCalled()
    })

    it('should return 403 if user is not ADMIN', async () => {
      req.user = { role: 'USER' } as any
      await isAdmin(req as Request, res as Response, next)
      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' })
    })
  })
})