import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import { ProductController } from '../../src/infrastructure/http/controllers/productController'
import { ProductUseCases } from '../../src/application/useCases/productUseCases'

const mockUseCases = {
  createProduct: vi.fn(),
  getProducts: vi.fn(),
  getProductById: vi.fn(),
  getProductHistory: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
} as unknown as ProductUseCases

const controller = new ProductController(mockUseCases)

const mockRequest = (body = {}, params = {}, query = {}, user = {}) => {
  return { body, params, query, user } as unknown as Request
}

const mockResponse = () => {
  const res = {} as Response
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  res.send = vi.fn().mockReturnValue(res)
  return res
}

// Mock NextFunction
const next = vi.fn() as unknown as NextFunction

describe('ProductController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should call next with error if missing fields', async () => {
      const error = new Error('Missing required fields')
      vi.mocked(mockUseCases.createProduct).mockRejectedValue(error)
      const req = mockRequest({})
      const res = mockResponse()
      await controller.create(req, res, next)
      expect(next).toHaveBeenCalledWith(error)
    })

    it('should call next with error if validation failed', async () => {
      const error = new Error('Validation failed: reason')
      vi.mocked(mockUseCases.createProduct).mockRejectedValue(error)
      const req = mockRequest({})
      const res = mockResponse()
      await controller.create(req, res, next)
      expect(next).toHaveBeenCalledWith(error)
    })

    it('should call next with error if financial entity error', async () => {
      const error = new Error('Financial Entity not found')
      vi.mocked(mockUseCases.createProduct).mockRejectedValue(error)
      const req = mockRequest({})
      const res = mockResponse()
      await controller.create(req, res, next)
      expect(next).toHaveBeenCalledWith(error)
    })

    it('should call next with error on generic error', async () => {
      const error = new Error('Boom')
      vi.mocked(mockUseCases.createProduct).mockRejectedValue(error)
      const req = mockRequest({})
      const res = mockResponse()
      await controller.create(req, res, next)
      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('getAll', () => {
    it('should call next with error on error', async () => {
      const error = new Error('Boom')
      vi.mocked(mockUseCases.getProducts).mockRejectedValue(error)
      const req = mockRequest()
      const res = mockResponse()
      await controller.getAll(req, res, next)
      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('getById', () => {
    it('should return 404 if not found', async () => {
      vi.mocked(mockUseCases.getProductById).mockResolvedValue(null)
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()
      await controller.getById(req, res, next)
      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('should call next with error on error', async () => {
      const error = new Error('Boom')
      vi.mocked(mockUseCases.getProductById).mockRejectedValue(error)
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()
      await controller.getById(req, res, next)
      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('update', () => {
    it('should call next with error if not found', async () => {
      const error = new Error('Product not found')
      vi.mocked(mockUseCases.updateProduct).mockRejectedValue(error)
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()
      await controller.update(req, res, next)
      expect(next).toHaveBeenCalledWith(error)
    })

    it('should call next with error on validation error', async () => {
      const error = new Error('Validation failed')
      vi.mocked(mockUseCases.updateProduct).mockRejectedValue(error)
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()
      await controller.update(req, res, next)
      expect(next).toHaveBeenCalledWith(error)
    })

    it('should call next with error on bad request (generic)', async () => {
      const error = new Error('Boom')
      vi.mocked(mockUseCases.updateProduct).mockRejectedValue(error)
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()
      await controller.update(req, res, next)
      expect(next).toHaveBeenCalledWith(error)
    })

    it('should call next with error on financial entity error', async () => {
      const error = new Error('Financial Entity not found')
      vi.mocked(mockUseCases.updateProduct).mockRejectedValue(error)
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()
      await controller.update(req, res, next)
      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('delete', () => {
    it('should call next with error if not found', async () => {
      const error = new Error('Product not found')
      vi.mocked(mockUseCases.deleteProduct).mockRejectedValue(error)
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()
      await controller.delete(req, res, next)
      expect(next).toHaveBeenCalledWith(error)
    })

    it('should call next with error on generic error', async () => {
      const error = new Error('Boom')
      vi.mocked(mockUseCases.deleteProduct).mockRejectedValue(error)
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()
      await controller.delete(req, res, next)
      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('getHistory', () => {
    it('should return 200 and history if found', async () => {
      const history = [{ date: new Date(), value: 100 }]
      vi.mocked(mockUseCases.getProductHistory).mockResolvedValue(history)
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()
      await controller.getHistory(req, res, next)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(history)
    })

    it('should return 404 if product not found', async () => {
      vi.mocked(mockUseCases.getProductHistory).mockResolvedValue(null)
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()
      await controller.getHistory(req, res, next)
      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('should call next with error on error', async () => {
      const error = new Error('Boom')
      vi.mocked(mockUseCases.getProductHistory).mockRejectedValue(error)
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()
      await controller.getHistory(req, res, next)
      expect(next).toHaveBeenCalledWith(error)
    })
  })
})
