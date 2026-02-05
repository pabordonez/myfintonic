import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import { ClientFinancialEntityController } from '../src/infrastructure/http/controllers/clientFinancialEntityController'
import { ClientFinancialEntityUseCases } from '../src/application/useCases/clientFinancialEntityUseCases'

const mockUseCases = {
  createAssociation: vi.fn(),
  getAssociations: vi.fn(),
  getAssociationById: vi.fn(),
  updateBalance: vi.fn(),
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
  res.send = vi.fn().mockReturnValue(res)
  return res
}

describe('ClientFinancialEntityController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should return 500 on generic error', async () => {
      vi.mocked(mockUseCases.createAssociation).mockRejectedValue(new Error('Generic Error'))
      const req = mockRequest({}, { clientId: '1' })
      const res = mockResponse()

      await controller.create(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' })
    })

    it('should return 409 if association already exists', async () => {
      const error: any = new Error('Unique constraint')
      error.code = 'P2002'
      vi.mocked(mockUseCases.createAssociation).mockRejectedValue(error)
      const req = mockRequest({}, { clientId: '1' })
      const res = mockResponse()
      await controller.create(req, res)
      expect(res.status).toHaveBeenCalledWith(409)
      expect(res.json).toHaveBeenCalledWith({ error: 'Association already exists' })
    })

    it('should return 404 if entity not found', async () => {
      vi.mocked(mockUseCases.createAssociation).mockRejectedValue(new Error('Financial Entity not found'))
      const req = mockRequest({}, { clientId: '1' })
      const res = mockResponse()
      await controller.create(req, res)
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ error: 'Financial Entity not found' })
    })
  })

  describe('getAll', () => {
    it('should return 500 on error', async () => {
      vi.mocked(mockUseCases.getAssociations).mockRejectedValue(new Error('Error'))
      const req = mockRequest({}, { clientId: '1' })
      const res = mockResponse()

      await controller.getAll(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  describe('getById', () => {
    it('should return 404 if not found', async () => {
      vi.mocked(mockUseCases.getAssociationById).mockResolvedValue(null)
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await controller.getById(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('should return 500 on error', async () => {
      vi.mocked(mockUseCases.getAssociationById).mockRejectedValue(new Error('Error'))
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await controller.getById(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  describe('updateBalance', () => {
    it('should return 404 if not found error', async () => {
      vi.mocked(mockUseCases.updateBalance).mockRejectedValue(new Error('Association not found'))
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await controller.updateBalance(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('should return 404 if not found error (message check)', async () => {
      vi.mocked(mockUseCases.updateBalance).mockRejectedValue(new Error('not found'))
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await controller.updateBalance(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('should return 500 on generic error', async () => {
      vi.mocked(mockUseCases.updateBalance).mockRejectedValue(new Error('Error'))
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await controller.updateBalance(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  describe('delete', () => {
    it('should return 404 if not found error', async () => {
      vi.mocked(mockUseCases.deleteAssociation).mockRejectedValue(new Error('Association not found'))
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await controller.delete(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('should return 500 on generic error', async () => {
      vi.mocked(mockUseCases.deleteAssociation).mockRejectedValue(new Error('Error'))
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await controller.delete(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })
})