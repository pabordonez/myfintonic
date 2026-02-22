import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import { FinancialEntityController } from '../../src/infrastructure/http/controllers/financialEntityController'
import { FinancialEntityUseCases } from '../../src/application/useCases/financialEntityUseCases'

// Mock use cases
const mockUseCases = {
  createEntity: vi.fn(),
  getEntities: vi.fn(),
  getEntityById: vi.fn(),
  updateEntity: vi.fn(),
  deleteEntity: vi.fn(),
} as unknown as FinancialEntityUseCases

const controller = new FinancialEntityController(mockUseCases)

// Helpers for Express mocks
const mockRequest = (body = {}, params = {}, query = {}) => {
  return { body, params, query } as unknown as Request
}

// Mock NextFunction
const next = vi.fn() as unknown as NextFunction

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
    it('should call next with error if use case fails', async () => {
      const error = new Error('DB Error')
      vi.mocked(mockUseCases.createEntity).mockRejectedValue(error)
      const req = mockRequest({ name: 'Bank' })
      const res = mockResponse()

      await controller.create(req, res, next)
      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('getAll', () => {
    it('should call next with error if use case fails', async () => {
      const error = new Error('DB Error')
      vi.mocked(mockUseCases.getEntities).mockRejectedValue(error)
      const req = mockRequest()
      const res = mockResponse()

      await controller.getAll(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('getById', () => {
    it('should return 404 if entity not found', async () => {
      vi.mocked(mockUseCases.getEntityById).mockResolvedValue(null)
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await controller.getById(req, res, next)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ error: 'Entity not found' })
    })

    it('should call next with error if use case fails', async () => {
      const error = new Error('DB Error')
      vi.mocked(mockUseCases.getEntityById).mockRejectedValue(error)
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await controller.getById(req, res, next)
      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('update', () => {
    it('should call next with error if entity not found error is thrown', async () => {
      const error = new Error('Financial Entity not found')
      vi.mocked(mockUseCases.updateEntity).mockRejectedValue(error)
      const req = mockRequest({ name: 'New Name' }, { id: '1' })
      const res = mockResponse()

      await controller.update(req, res, next)
      expect(next).toHaveBeenCalledWith(error)
    })

    it('should call next with error for other errors', async () => {
      const error = new Error('Validation Error')
      vi.mocked(mockUseCases.updateEntity).mockRejectedValue(error)
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await controller.update(req, res, next)
      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('delete', () => {
    it('should call next with error for generic errors', async () => {
      const error = new Error('DB Error')
      vi.mocked(mockUseCases.deleteEntity).mockRejectedValue(error)
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await controller.delete(req, res, next)
      expect(next).toHaveBeenCalledWith(error)
    })

    it('should call next with error if entity not found', async () => {
      const error = new Error('Financial Entity not found')
      vi.mocked(mockUseCases.deleteEntity).mockRejectedValue(error)
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await controller.delete(req, res, next)
      expect(next).toHaveBeenCalledWith(error)
    })
  })
})
