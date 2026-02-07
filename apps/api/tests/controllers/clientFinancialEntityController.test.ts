import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import { ClientFinancialEntityController } from '../../src/infrastructure/http/controllers/clientFinancialEntityController'
import { ClientFinancialEntityUseCases } from '../../src/application/useCases/clientFinancialEntityUseCases'

const mockUseCases = {
  createAssociation: vi.fn(),
  getAssociations: vi.fn(),
  getAssociationById: vi.fn(),
  updateBalance: vi.fn(),
  getAllAssociations: vi.fn(),
  deleteAssociation: vi.fn(),
} as unknown as ClientFinancialEntityUseCases

const controller = new ClientFinancialEntityController(mockUseCases)

const mockRequest = (body = {}, params = {}, query = {}) => {
  return { body, params, query } as unknown as Request
}

const mockResponse = () => {
  const res = {} as Response
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe('ClientFinancialEntityController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should return 201 and created association', async () => {
      const dto = { clientId: 'c1', financialEntityId: 'fe1', balance: 100 }
      vi.mocked(mockUseCases.createAssociation).mockResolvedValue({
        id: '1',
        ...dto,
      } as any)
      const req = mockRequest(
        { financialEntityId: 'fe1', balance: 100 },
        { clientId: 'c1' }
      )
      const res = mockResponse()

      await controller.create(req, res)

      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: '1' })
      )
    })

    it('should return 409 if association exists (P2002)', async () => {
      const error: any = new Error('Unique constraint')
      error.code = 'P2002'
      vi.mocked(mockUseCases.createAssociation).mockRejectedValue(error)
      const req = mockRequest({}, { clientId: 'c1' })
      const res = mockResponse()

      await controller.create(req, res)

      expect(res.status).toHaveBeenCalledWith(409)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Association already exists',
      })
    })

    it('should return 404 if entity not found', async () => {
      vi.mocked(mockUseCases.createAssociation).mockRejectedValue(
        new Error('Entity not found')
      )
      const req = mockRequest({}, { clientId: 'c1' })
      const res = mockResponse()

      await controller.create(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ error: 'Entity not found' })
    })
  })

  describe('getAllAssociations', () => {
    it('should return 200 and list', async () => {
      const list = [{ id: '1', client: { email: 'test@test.com' } }]
      vi.mocked(mockUseCases.getAllAssociations).mockResolvedValue(list as any)
      const req = mockRequest()
      const res = mockResponse()

      await controller.getAllAssociations(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(list)
    })

    it('should return 500 on error', async () => {
      vi.mocked(mockUseCases.getAllAssociations).mockRejectedValue(
        new Error('Error')
      )
      const req = mockRequest()
      const res = mockResponse()

      await controller.getAllAssociations(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  describe('getAll', () => {
    it('should return 200 and filtered list', async () => {
      const list = [{ id: '1' }]
      vi.mocked(mockUseCases.getAssociations).mockResolvedValue(list as any)
      const req = mockRequest(
        {},
        { clientId: 'c1' },
        { financialEntityId: 'fe1' }
      )
      const res = mockResponse()

      await controller.getAll(req, res)

      expect(mockUseCases.getAssociations).toHaveBeenCalledWith({
        clientId: 'c1',
        financialEntityId: 'fe1',
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(list)
    })
  })

  describe('getById', () => {
    it('should return 200 if found', async () => {
      vi.mocked(mockUseCases.getAssociationById).mockResolvedValue({
        id: '1',
      } as any)
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await controller.getById(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ id: '1' })
    })

    it('should return 404 if not found', async () => {
      vi.mocked(mockUseCases.getAssociationById).mockResolvedValue(null)
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await controller.getById(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
    })
  })

  describe('updateBalance', () => {
    it('should return 204 on success', async () => {
      vi.mocked(mockUseCases.updateBalance).mockResolvedValue()
      const req = mockRequest({ balance: 200 }, { id: '1' })
      const res = mockResponse()

      await controller.updateBalance(req, res)

      expect(res.status).toHaveBeenCalledWith(204)
    })

    it('should return 404 if not found', async () => {
      vi.mocked(mockUseCases.updateBalance).mockRejectedValue(
        new Error('not found')
      )
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await controller.updateBalance(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
    })
  })

  describe('delete', () => {
    it('should return 204 on success', async () => {
      vi.mocked(mockUseCases.deleteAssociation).mockResolvedValue()
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await controller.delete(req, res)

      expect(res.status).toHaveBeenCalledWith(204)
    })

    it('should return 404 if not found', async () => {
      vi.mocked(mockUseCases.deleteAssociation).mockRejectedValue(
        new Error('not found')
      )
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await controller.delete(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
    })
  })
})
