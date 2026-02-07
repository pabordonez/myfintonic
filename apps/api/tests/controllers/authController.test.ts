import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import { AuthController } from '../../src/infrastructure/http/controllers/authController'
import { AuthUseCases } from '../../src/application/useCases/authUseCases'

vi.mock('../../src/application/useCases/authUseCases')

describe('AuthController', () => {
  let controller: AuthController
  let useCases: AuthUseCases
  let req: Partial<Request>
  let res: Partial<Response>
  let json: any
  let status: any
  let cookie: any

  beforeEach(() => {
    useCases = new AuthUseCases({} as any)
    controller = new AuthController(useCases)
    json = vi.fn()
    status = vi.fn().mockReturnValue({ json })
    cookie = vi.fn()
    res = { status, cookie } as unknown as Response
  })

  describe('login', () => {
    it('should return 200 and token on success (without password)', async () => {
      const userWithPassword = {
        id: '1',
        email: 'a@b.c',
        role: 'USER',
      }
      const userWithoutPassword = { id: '1', email: 'a@b.c', role: 'USER' }
      const result = {
        token: 'abc',
        user: userWithPassword,
      }
      vi.mocked(useCases.login).mockResolvedValue(result)
      req = { body: { email: 'a@b.c', password: '123' } }

      await controller.login(req as Request, res as Response)

      expect(status).toHaveBeenCalledWith(200)
      expect(json).toHaveBeenCalledWith({
        token: 'abc',
        user: userWithoutPassword,
      })
    })

    it('should return 401 on failure', async () => {
      vi.mocked(useCases.login).mockRejectedValue(new Error('Invalid'))
      req = { body: { email: 'a@b.c', password: '123' } }

      await controller.login(req as Request, res as Response)

      expect(status).toHaveBeenCalledWith(401)
      expect(json).toHaveBeenCalledWith({ error: 'Invalid' })
    })

    it('should return 401 with default message on failure without message', async () => {
      vi.mocked(useCases.login).mockRejectedValue(new Error())
      req = { body: { email: 'a@b.c', password: '123' } }

      await controller.login(req as Request, res as Response)

      expect(status).toHaveBeenCalledWith(401)
      expect(json).toHaveBeenCalledWith({ error: 'Invalid credentials' })
    })
  })

  describe('logout', () => {
    it('should clear cookie and return 200', async () => {
      await controller.logout(req as Request, res as Response)

      expect(cookie).toHaveBeenCalledWith(
        'token',
        '',
        expect.objectContaining({ maxAge: 0, httpOnly: true })
      )
      expect(status).toHaveBeenCalledWith(200)
      expect(json).toHaveBeenCalledWith({ message: 'Logged out successfully' })
    })
  })
})
