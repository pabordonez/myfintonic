import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ClientController } from '../../src/infrastructure/http/controllers/clientController'
import { ClientUseCases } from '../../src/application/useCases/clientUseCases'
import { Request, Response } from 'express'

describe('ClientController', () => {
  let controller: ClientController
  let useCases: ClientUseCases
  let req: Partial<Request>
  let res: Partial<Response>
  let json: any
  let status: any

  beforeEach(() => {
    useCases = {
      register: vi.fn(),
      getClients: vi.fn(),
      getClientById: vi.fn(),
      updateClient: vi.fn(),
      changePassword: vi.fn(),
    } as unknown as ClientUseCases
    controller = new ClientController(useCases)
    json = vi.fn()
    status = vi.fn().mockReturnValue({ json, send: vi.fn() })
    res = { status, json } as unknown as Response
  })

  describe('register', () => {
    it('should return 409 if email exists', async () => {
      req = { body: {} } as any
      vi.mocked(useCases.register).mockRejectedValue(
        new Error('Email already in use')
      )
      await controller.register(req as Request, res as Response)
      expect(status).toHaveBeenCalledWith(409)
    })

    it('should return 400 on other errors', async () => {
      req = { body: {} } as any
      vi.mocked(useCases.register).mockRejectedValue(new Error('Boom'))
      await controller.register(req as Request, res as Response)
      expect(status).toHaveBeenCalledWith(400)
    })
  })

  describe('getAll', () => {
    it('should return 403 if user is not ADMIN', async () => {
      req = { user: { role: 'USER' } } as any
      await controller.getAll(req as Request, res as Response)
      expect(status).toHaveBeenCalledWith(403)
    })
  })

  describe('getById', () => {
    it('should return 403 if user accesses another profile', async () => {
      req = { user: { role: 'USER', id: 'u1' }, params: { id: 'u2' } } as any
      await controller.getById(req as Request, res as Response)
      expect(status).toHaveBeenCalledWith(403)
    })

    it('should return 404 if client not found', async () => {
      req = {
        user: { role: 'ADMIN', id: 'admin' },
        params: { id: 'u1' },
      } as any
      vi.mocked(useCases.getClientById).mockResolvedValue(null)
      await controller.getById(req as Request, res as Response)
      expect(status).toHaveBeenCalledWith(404)
    })
  })

  describe('update', () => {
    it('should return 403 if user updates another profile', async () => {
      req = { user: { role: 'USER', id: 'u1' }, params: { id: 'u2' } } as any
      await controller.update(req as Request, res as Response)
      expect(status).toHaveBeenCalledWith(403)
    })
  })

  describe('changePassword', () => {
    it('should return 400 if new password missing', async () => {
      req = { params: { id: 'u1' }, body: {}, user: { id: 'u1' } } as any
      await controller.changePassword(req as Request, res as Response)
      expect(status).toHaveBeenCalledWith(400)
    })

    it('should handle Forbidden error', async () => {
      req = {
        params: { id: 'u1' },
        body: { newPassword: '123' },
        user: { id: 'u1' },
      } as any
      vi.mocked(useCases.changePassword).mockRejectedValue(
        new Error('Forbidden access')
      )
      await controller.changePassword(req as Request, res as Response)
      expect(status).toHaveBeenCalledWith(403)
    })

    it('should handle Invalid/Required error', async () => {
      req = {
        params: { id: 'u1' },
        body: { newPassword: '123' },
        user: { id: 'u1' },
      } as any
      vi.mocked(useCases.changePassword).mockRejectedValue(
        new Error('Invalid password')
      )
      await controller.changePassword(req as Request, res as Response)
      expect(status).toHaveBeenCalledWith(400)
    })

    it('should handle Not Found error', async () => {
      req = {
        params: { id: 'u1' },
        body: { newPassword: '123' },
        user: { id: 'u1' },
      } as any
      vi.mocked(useCases.changePassword).mockRejectedValue(
        new Error('User not found')
      )
      await controller.changePassword(req as Request, res as Response)
      expect(status).toHaveBeenCalledWith(404)
    })

    it('should handle unexpected error', async () => {
      req = {
        params: { id: 'u1' },
        body: { newPassword: '123' },
        user: { id: 'u1' },
      } as any
      vi.mocked(useCases.changePassword).mockRejectedValue(new Error('Boom'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      await controller.changePassword(req as Request, res as Response)
      expect(status).toHaveBeenCalledWith(500)
      consoleSpy.mockRestore()
    })
  })
})
