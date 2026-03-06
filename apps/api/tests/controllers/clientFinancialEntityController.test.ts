import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ClientFinancialEntityController } from '../../src/infrastructure/http/controllers/clientFinancialEntityController'
import { ClientFinancialEntityUseCases } from '../../src/application/useCases/clientFinancialEntityUseCases'
import { Request, Response, NextFunction } from 'express'

describe('ClientFinancialEntityController', () => {
  let controller: ClientFinancialEntityController
  let useCases: ClientFinancialEntityUseCases
  let req: Partial<Request>
  let res: Partial<Response>
  let json: any
  let status: any
  let next: NextFunction

  beforeEach(() => {
    useCases = {
      createAssociation: vi.fn(),
      getAssociationsByClientId: vi.fn(),
      getAssociationById: vi.fn(),
      updateBalance: vi.fn(),
      deleteAssociation: vi.fn(),
      getAllAssociations: vi.fn(),
    } as unknown as ClientFinancialEntityUseCases
    controller = new ClientFinancialEntityController(useCases)
    json = vi.fn()
    status = vi.fn().mockReturnValue({ json, send: vi.fn() })
    res = { status, json } as unknown as Response
    next = vi.fn() as unknown as NextFunction
  })

  describe('create', () => {
    it('should call next with error on generic error', async () => {
      req = { params: { clientId: 'c1' }, body: {} } as any
      const error = new Error('Boom')
      vi.mocked(useCases.createAssociation).mockRejectedValue(error)

      await controller.create(req as Request, res as Response, next)
      expect(next).toHaveBeenCalledWith(error)
    })

    it('should return 201 on success', async () => {
      req = { params: { clientId: 'c1' }, body: {} } as any
      vi.mocked(useCases.createAssociation).mockResolvedValue({
        id: '1',
      } as any)

      await controller.create(req as Request, res as Response, next)

      expect(status).toHaveBeenCalledWith(201)
      expect(json).toHaveBeenCalledWith({ id: '1' })
    })
  })

  describe('update', () => {
    it('should call next with error if association not found', async () => {
      req = { params: { id: '1' }, body: {} } as any
      const error = new Error('Association not found')
      vi.mocked(useCases.updateBalance).mockRejectedValue(error)

      await controller.updateBalance(req as Request, res as Response, next)
      expect(next).toHaveBeenCalledWith(error)
    })

    it('should call next with error on generic error', async () => {
      req = { params: { id: '1' }, body: {} } as any
      const error = new Error('Boom')
      vi.mocked(useCases.updateBalance).mockRejectedValue(error)

      await controller.updateBalance(req as Request, res as Response, next)
      expect(next).toHaveBeenCalledWith(error)
    })

    it('should return 204 on success', async () => {
      req = { params: { id: '1' }, body: {} } as any
      vi.mocked(useCases.updateBalance).mockResolvedValue()

      await controller.updateBalance(req as Request, res as Response, next)

      expect(status).toHaveBeenCalledWith(204)
    })
  })

  describe('delete', () => {
    it('should return 204 on success', async () => {
      req = { params: { id: '1' } } as any
      await controller.delete(req as Request, res as Response, next)
      expect(status).toHaveBeenCalledWith(204)
    })

    it('should call next with error on error', async () => {
      req = { params: { id: '1' } } as any
      const error = new Error('Boom')
      vi.mocked(useCases.deleteAssociation).mockRejectedValue(error)

      await controller.delete(req as Request, res as Response, next)
      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('getAllAssociations', () => {
    it('should return 200 on success', async () => {
      req = {
        query: {},
        params: {},
        body: {},
        user: { role: 'ADMIN', id: 'admin-1' },
      } as any
      const mockAssociations = [
        {
          id: '1',
          clientId: 'c1',
          financialEntityId: 'fe1',
          balance: 100,
          client: { firstName: 'John', lastName: 'Doe' },
          financialEntity: { name: 'Bank' },
        },
      ]
      vi.mocked(useCases.getAllAssociations).mockResolvedValue(
        mockAssociations as any
      )

      await controller.getAllAssociations(req as Request, res as Response, next)

      expect(status).toHaveBeenCalledWith(200)
      expect(json).toHaveBeenCalledWith(mockAssociations)
    })

    it('should call next with error on error', async () => {
      req = {
        query: {},
        params: {},
        body: {},
        user: { role: 'ADMIN', id: 'admin-1' },
      } as any
      const error = new Error('Boom')
      vi.mocked(useCases.getAllAssociations).mockRejectedValue(error)

      await controller.getAllAssociations(req as Request, res as Response, next)
      expect(next).toHaveBeenCalledWith(error)
    })
  })
})
