import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import { AuthController } from '../src/infrastructure/http/controllers/authController'
import { AuthUseCases } from '../src/application/useCases/authUseCases'

vi.mock('../src/application/useCases/authUseCases')

describe('AuthController', () => {
  let controller: AuthController
  let useCases: AuthUseCases
  let req: Partial<Request>
  let res: Partial<Response>
  let json: any
  let status: any

  beforeEach(() => {
    useCases = new AuthUseCases()
    controller = new AuthController(useCases)
    json = vi.fn()
    status = vi.fn().mockReturnValue({ json })
    res = { status } as unknown as Response
  })

  describe('login', () => {
    it('should return 200 and token on success', async () => {
      const result = { token: 'abc', user: { id: '1', email: 'a@b.c', role: 'USER' } }
      vi.mocked(useCases.login).mockResolvedValue(result)
      req = { body: { email: 'a@b.c', password: '123' } }

      await controller.login(req as Request, res as Response)

      expect(status).toHaveBeenCalledWith(200)
      expect(json).toHaveBeenCalledWith(result)
    })

    it('should return 401 on failure', async () => {
      vi.mocked(useCases.login).mockRejectedValue(new Error('Invalid'))
      req = { body: { email: 'a@b.c', password: '123' } }

      await controller.login(req as Request, res as Response)

      expect(status).toHaveBeenCalledWith(401)
      expect(json).toHaveBeenCalledWith({ error: 'Invalid credentials' })
    })
  })
})