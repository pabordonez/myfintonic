import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { authenticate } from '../src/infrastructure/http/middlewares/authenticate'
import { isAdmin } from '../src/infrastructure/http/middlewares/isAdmin'
import { env } from '../src/config/env'
import { requestLogger } from '../src/infrastructure/http/middlewares/requestLogger'
import { clientOwnershipMiddleware } from '../src/infrastructure/http/middlewares/clientOwnershipMiddleware'
import { productOwnershipMiddleware } from '../src/infrastructure/http/middlewares/ownershipMiddleware'
import prismaMock from '../src/infrastructure/persistence/prisma/client'

vi.mock('jsonwebtoken')

describe('Middlewares', () => {
  let req: any
  let res: any
  let next: NextFunction

  beforeEach(() => {
    req = {
      headers: {},
      cookies: {},
      user: undefined,
      header: vi.fn((name: string) =>
        req.headers ? req.headers[name.toLowerCase()] : undefined
      ),
      originalUrl: '/test',
    } as any

    // Creamos el objeto mock primero para asegurar que las referencias sean circulares y correctas
    const resMock: any = {
      status: vi.fn(),
      json: vi.fn(),
      send: vi.fn(),
      sendStatus: vi.fn(),
      on: vi.fn(),
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
      req.cookies = { token: 'valid-token' }
      vi.mocked(jwt.verify).mockReturnValue({ id: '1', role: 'USER' } as any)

      authenticate(req as Request, res as Response, next)

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', env.JWT_SECRET)
      expect((req as any).user).toEqual({ id: '1', role: 'USER' })
      expect(next).toHaveBeenCalled()
    })

    it('should return 401 if no token provided', () => {
      req.cookies = {}
      authenticate(req as Request, res as Response, next)
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' })
    })

    it('should return 401 if token is invalid', () => {
      req.cookies = { token: 'invalid-token' }
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error('Invalid token')
      })

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

  describe('requestLogger', () => {
    it('should log sanitized body', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      req.method = 'POST'
      req.originalUrl = '/auth/login'
      req.body = { email: 'test@test.com', password: 'secret-password' }
      res.statusCode = 200

      let finishCallback: (() => void) | undefined
      res.on.mockImplementation((event: string, cb: () => void) => {
        if (event === 'finish') finishCallback = cb
      })

      requestLogger(req, res, next)
      expect(next).toHaveBeenCalled()

      if (finishCallback) finishCallback()

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('POST /auth/login 200'),
        expect.objectContaining({
          body: { email: 'test@test.com', password: '***' },
        })
      )
      consoleSpy.mockRestore()
    })

    it('should use req.url if originalUrl is missing', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      req.originalUrl = undefined
      req.url = '/fallback-url'
      res.statusCode = 200

      let finishCallback: (() => void) | undefined
      res.on.mockImplementation((event: string, cb: () => void) => {
        if (event === 'finish') finishCallback = cb
      })

      requestLogger(req, res, next)
      if (finishCallback) finishCallback()

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('/fallback-url'),
        expect.anything()
      )
      consoleSpy.mockRestore()
    })
  })

  describe('clientOwnershipMiddleware', () => {
    it('should allow ADMIN to bypass', () => {
      req.user = { role: 'ADMIN', id: 'admin' }
      clientOwnershipMiddleware(req, res, next)
      expect(next).toHaveBeenCalled()
    })

    it('should allow user accessing their own resource', () => {
      req.user = { role: 'USER', id: 'u1' }
      req.params = { clientId: 'u1' }
      clientOwnershipMiddleware(req, res, next)
      expect(next).toHaveBeenCalled()
    })

    it('should block user accessing other resource', () => {
      req.user = { role: 'USER', id: 'u1' }
      req.params = { clientId: 'u2' }
      clientOwnershipMiddleware(req, res, next)
      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Forbidden: You can only access your own resources',
      })
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('productOwnershipMiddleware', () => {
    // Mockeamos prisma directamente ya que el middleware lo importa
    vi.mock('../src/infrastructure/persistence/prisma/client', () => ({
      default: {
        financialProduct: {
          findUnique: vi.fn(),
        },
      },
    }))

    it('should allow ADMIN to bypass', async () => {
      req.user = { role: 'ADMIN', id: 'admin' }
      await productOwnershipMiddleware(req, res, next)
      expect(next).toHaveBeenCalled()
    })

    it('should return 400 if context is invalid (missing id)', async () => {
      req.user = { role: 'USER', id: 'u1' }
      req.params = {} // Missing id
      await productOwnershipMiddleware(req, res, next)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid request context',
      })
    })

    it('should return 404 if product not found', async () => {
      req.user = { role: 'USER', id: 'u1' }
      req.params = { id: 'p1' }
      vi.mocked(prismaMock.financialProduct.findUnique).mockResolvedValue(null)

      await productOwnershipMiddleware(req, res, next)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' })
      expect(next).not.toHaveBeenCalled()
    })

    it('should return 404 (Security) if product belongs to another user', async () => {
      req.user = { role: 'USER', id: 'u1' }
      req.params = { id: 'p1' }
      vi.mocked(prismaMock.financialProduct.findUnique).mockResolvedValue({
        clientId: 'u2',
      } as any)

      await productOwnershipMiddleware(req, res, next)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' })
      expect(next).not.toHaveBeenCalled()
    })

    it('should allow if product belongs to user', async () => {
      req.user = { role: 'USER', id: 'u1' }
      req.params = { id: 'p1' }
      vi.mocked(prismaMock.financialProduct.findUnique).mockResolvedValue({
        clientId: 'u1',
      } as any)

      await productOwnershipMiddleware(req, res, next)

      expect(next).toHaveBeenCalled()
    })

    it('should return 500 on unexpected error', async () => {
      req.user = { role: 'USER', id: 'u1' }
      req.params = { id: 'p1' }
      vi.mocked(prismaMock.financialProduct.findUnique).mockRejectedValue(
        new Error('DB Error')
      )

      await productOwnershipMiddleware(req, res, next)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })
})
