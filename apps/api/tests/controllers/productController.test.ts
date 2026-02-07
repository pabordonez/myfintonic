import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response } from 'express'
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

describe('ProductController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should return 400 if missing fields', async () => {
      vi.mocked(mockUseCases.createProduct).mockRejectedValue(
        new Error('Missing required fields')
      )
      const req = mockRequest({})
      const res = mockResponse()
      await controller.create(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing required fields',
      })
    })

    it('should return 400 if validation failed', async () => {
      vi.mocked(mockUseCases.createProduct).mockRejectedValue(
        new Error('Validation failed: reason')
      )
      const req = mockRequest({})
      const res = mockResponse()
      await controller.create(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('should return 400 if financial entity error', async () => {
      vi.mocked(mockUseCases.createProduct).mockRejectedValue(
        new Error('Financial Entity not found')
      )
      const req = mockRequest({})
      const res = mockResponse()
      await controller.create(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('should return 500 on generic error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(mockUseCases.createProduct).mockRejectedValue(new Error('Boom'))
      const req = mockRequest({})
      const res = mockResponse()
      await controller.create(req, res)
      expect(res.status).toHaveBeenCalledWith(500)
      consoleSpy.mockRestore()
    })
  })

  describe('getAll', () => {
    it('should return 500 on error', async () => {
      vi.mocked(mockUseCases.getProducts).mockRejectedValue(new Error('Boom'))
      const req = mockRequest()
      const res = mockResponse()
      await controller.getAll(req, res)
      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  describe('getById', () => {
    it('should return 404 if not found', async () => {
      vi.mocked(mockUseCases.getProductById).mockResolvedValue(null)
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()
      await controller.getById(req, res)
      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('should return 500 on error', async () => {
      vi.mocked(mockUseCases.getProductById).mockRejectedValue(
        new Error('Boom')
      )
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()
      await controller.getById(req, res)
      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  describe('update', () => {
    it('should return 404 if not found', async () => {
      vi.mocked(mockUseCases.updateProduct).mockRejectedValue(
        new Error('Product not found')
      )
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()
      await controller.update(req, res)
      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('should return 400 on validation error', async () => {
      vi.mocked(mockUseCases.updateProduct).mockRejectedValue(
        new Error('Validation failed')
      )
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()
      await controller.update(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('should return 400 on bad request (generic)', async () => {
      vi.mocked(mockUseCases.updateProduct).mockRejectedValue(new Error('Boom'))
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()
      await controller.update(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ error: 'Bad Request' })
    })

    it('should return 400 on financial entity error', async () => {
      vi.mocked(mockUseCases.updateProduct).mockRejectedValue(
        new Error('Financial Entity not found')
      )
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()
      await controller.update(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
    })
  })

  describe('delete', () => {
    it('should return 404 if not found', async () => {
      vi.mocked(mockUseCases.deleteProduct).mockRejectedValue(
        new Error('Product not found')
      )
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()
      await controller.delete(req, res)
      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('should return 500 on generic error', async () => {
      vi.mocked(mockUseCases.deleteProduct).mockRejectedValue(new Error('Boom'))
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()
      await controller.delete(req, res)
      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  describe('getHistory', () => {
    it('should return 200 and history if found', async () => {
      const history = [{ date: new Date(), value: 100 }]
      vi.mocked(mockUseCases.getProductHistory).mockResolvedValue(history)
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()
      await controller.getHistory(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(history)
    })

    it('should return 404 if product not found', async () => {
      vi.mocked(mockUseCases.getProductHistory).mockResolvedValue(null)
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()
      await controller.getHistory(req, res)
      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('should return 500 on error', async () => {
      vi.mocked(mockUseCases.getProductHistory).mockRejectedValue(
        new Error('Boom')
      )
      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()
      await controller.getHistory(req, res)
      expect(res.status).toHaveBeenCalledWith(500)
    })
  })
})
