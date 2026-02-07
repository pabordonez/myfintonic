import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ClientFinancialEntityController } from '../../src/infrastructure/http/controllers/clientFinancialEntityController'
import { ClientFinancialEntityUseCases } from '../../src/application/useCases/clientFinancialEntityUseCases'
import { Request, Response } from 'express'

describe('ClientFinancialEntityController', () => {
  let controller: ClientFinancialEntityController
  let useCases: ClientFinancialEntityUseCases
  let req: Partial<Request>
  let res: Partial<Response>
  let json: any
  let status: any

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
  })

  describe('create', () => {
    it('should return 500 on generic error', async () => {
      req = { params: { clientId: 'c1' }, body: {} } as any
      vi.mocked(useCases.createAssociation).mockRejectedValue(new Error('Boom'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await controller.create(req as Request, res as Response)

      expect(status).toHaveBeenCalledWith(500)
      consoleSpy.mockRestore()
    })

    it('should return 201 on success', async () => {
      req = { params: { clientId: 'c1' }, body: {} } as any
      vi.mocked(useCases.createAssociation).mockResolvedValue({
        id: '1',
      } as any)

      await controller.create(req as Request, res as Response)

      expect(status).toHaveBeenCalledWith(201)
      expect(json).toHaveBeenCalledWith({ id: '1' })
    })
  })

  describe('update', () => {
    it('should return 404 if association not found', async () => {
      req = { params: { id: '1' }, body: {} } as any
      vi.mocked(useCases.updateBalance).mockRejectedValue(
        new Error('Association not found')
      )

      await controller.updateBalance(req as Request, res as Response)

      expect(status).toHaveBeenCalledWith(404)
    })

    it('should return 400 on generic error', async () => {
      req = { params: { id: '1' }, body: {} } as any
      vi.mocked(useCases.updateBalance).mockRejectedValue(new Error('Boom'))

      await controller.updateBalance(req as Request, res as Response)

      expect(status).toHaveBeenCalledWith(500)
    })

    it('should return 204 on success', async () => {
      req = { params: { id: '1' }, body: {} } as any
      vi.mocked(useCases.updateBalance).mockResolvedValue()

      await controller.updateBalance(req as Request, res as Response)

      expect(status).toHaveBeenCalledWith(204)
    })
  })

  describe('delete', () => {
    it('should return 204 on success', async () => {
      req = { params: { id: '1' } } as any
      await controller.delete(req as Request, res as Response)
      expect(status).toHaveBeenCalledWith(204)
    })

    it('should return 500 on error', async () => {
      req = { params: { id: '1' } } as any
      vi.mocked(useCases.deleteAssociation).mockRejectedValue(new Error('Boom'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await controller.delete(req as Request, res as Response)

      expect(status).toHaveBeenCalledWith(500)
      consoleSpy.mockRestore()
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

      await controller.getAllAssociations(req as Request, res as Response)

      expect(status).toHaveBeenCalledWith(200)
      expect(json).toHaveBeenCalledWith(mockAssociations)
    })

    it('should return 500 on error', async () => {
      req = {
        query: {},
        params: {},
        body: {},
        user: { role: 'ADMIN', id: 'admin-1' },
      } as any
      vi.mocked(useCases.getAllAssociations).mockRejectedValue(
        new Error('Boom')
      )
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await controller.getAllAssociations(req as Request, res as Response)

      expect(status).toHaveBeenCalledWith(500)
      consoleSpy.mockRestore()
    })
  })
})
