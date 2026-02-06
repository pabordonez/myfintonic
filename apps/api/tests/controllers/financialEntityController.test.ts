import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import { FinancialEntityController } from '../../src/infrastructure/http/controllers/financialEntityController'
import { FinancialEntityUseCases } from '../../src/application/useCases/financialEntityUseCases'

// Mock de los casos de uso
const mockUseCases = {
  createEntity: vi.fn(),
  getEntities: vi.fn(),
  getEntityById: vi.fn(),
  updateEntity: vi.fn(),
  deleteEntity: vi.fn(),
} as unknown as FinancialEntityUseCases

const controller = new FinancialEntityController(mockUseCases)

// Helpers para mocks de Express
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

describe('FinancialEntityController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should return 500 if use case fails', async () => {
      vi.mocked(mockUseCases.createEntity).mockRejectedValue(new Error('DB Error'))
      const req = mockRequest({ name: 'Bank' })
      const res = mockResponse()

      await controller.create(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' })
    })
  })

  describe('getAll', () => {
    it('should return 500 if use case fails', async () => {
      vi.mocked(mockUseCases.getEntities).mockRejectedValue(new Error('DB Error'))
      const req = mockRequest()
      const res = mockResponse()

      await controller.getAll(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  describe('getById', () => {
    it('should return 404 if entity not found', async () => {
      vi.mocked(mockUseCases.getEntityById).mockResolvedValue(null)
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await controller.getById(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ error: 'Entity not found' })
    })

    it('should return 500 if use case fails', async () => {
      vi.mocked(mockUseCases.getEntityById).mockRejectedValue(new Error('DB Error'))
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await controller.getById(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  describe('update', () => {
    it('should return 404 if entity not found error is thrown', async () => {
      vi.mocked(mockUseCases.updateEntity).mockRejectedValue(new Error('Financial Entity not found'))
      const req = mockRequest({ name: 'New Name' }, { id: '1' })
      const res = mockResponse()

      await controller.update(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ error: 'Financial Entity not found' })
    })

    it('should return 400 for other errors', async () => {
      vi.mocked(mockUseCases.updateEntity).mockRejectedValue(new Error('Validation Error'))
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await controller.update(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })
  })

  describe('delete', () => {
    it('should return 500 for generic errors', async () => {
      // El caso 404 ya suele estar cubierto, cubrimos el 500
      vi.mocked(mockUseCases.deleteEntity).mockRejectedValue(new Error('DB Error'))
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await controller.delete(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })

    it('should return 404 if entity not found', async () => {
      vi.mocked(mockUseCases.deleteEntity).mockRejectedValue(new Error('Financial Entity not found'))
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await controller.delete(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ error: 'Financial Entity not found' })
    })

    it('should return 500 for generic errors', async () => {
      vi.mocked(mockUseCases.deleteEntity).mockRejectedValue(new Error('DB Error'))
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await controller.delete(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })
})