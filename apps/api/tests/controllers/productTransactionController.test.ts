import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProductTransactionController } from '../../src/infrastructure/http/controllers/ProductTransactionController'
import { ProductTransactionUseCases } from '../../src/application/useCases/ProductTransactionUseCases'
import { Request, Response } from 'express'

// Mock del caso de uso
const mockUseCase = {
  add: vi.fn(),
  getProductTransactions: vi.fn(),
} as unknown as ProductTransactionUseCases

// Mock de Response de Express
const mockRes = {
  status: vi.fn().mockReturnThis(),
  json: vi.fn(),
} as unknown as Response

const controller = new ProductTransactionController(mockUseCase)

describe('ProductTransactionController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('addTransaction', () => {
    it('should return 201 when transaction is created successfully', async () => {
      const req = {
        params: { id: 'prod-1' },
        user: { id: 'user-1' },
        body: {
          description: 'Test Transaction',
          date: '2023-10-27T10:00:00Z',
          amount: 100
        }
      } as unknown as Request

      vi.mocked(mockUseCase.add).mockResolvedValue(undefined)

      await controller.addTransaction(req, mockRes)

      expect(mockUseCase.add).toHaveBeenCalledWith({
        userId: 'user-1',
        productId: 'prod-1',
        description: 'Test Transaction',
        date: expect.any(Date),
        amount: 100
      })
      expect(mockRes.status).toHaveBeenCalledWith(201)
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Transaction added successfully' })
    })

    it('should return 401 if user is not authenticated', async () => {
      const req = {
        params: { id: 'prod-1' },
        user: undefined, // No user
        body: {}
      } as unknown as Request

      await controller.addTransaction(req, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
    })

    it('should return 400 if validation fails (Zod)', async () => {
      const req = {
        params: { id: 'prod-1' },
        user: { id: 'user-1' },
        body: {
          // Missing description and amount
          date: 'invalid-date'
        }
      } as unknown as Request

      await controller.addTransaction(req, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Validation Error'
      }))
    })

    it('should return 404 if product not found', async () => {
      const req = {
        params: { id: 'prod-1' },
        user: { id: 'user-1' },
        body: {
          description: 'Test',
          date: new Date().toISOString(),
          amount: 100
        }
      } as unknown as Request

      const error = new Error('Product not found')
      vi.mocked(mockUseCase.add).mockRejectedValue(error)

      await controller.addTransaction(req, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(404)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Product not found' })
    })

    it('should return 403 if unauthorized access to product', async () => {
      const req = {
        params: { id: 'prod-1' },
        user: { id: 'user-1' },
        body: {
          description: 'Test',
          date: new Date().toISOString(),
          amount: 100
        }
      } as unknown as Request

      const error = new Error('Unauthorized access to product')
      vi.mocked(mockUseCase.add).mockRejectedValue(error)

      await controller.addTransaction(req, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(403)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized access to product' })
    })

    it('should return 500 on unexpected error', async () => {
      const req = {
        params: { id: 'prod-1' },
        user: { id: 'user-1' },
        body: {
          description: 'Test',
          date: new Date().toISOString(),
          amount: 100
        }
      } as unknown as Request

      vi.mocked(mockUseCase.add).mockRejectedValue(new Error('Boom'))

      await controller.addTransaction(req, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal Server Error' })
    })
  })

  describe('getTransaction', () => {
    it('should return 200 and transactions list', async () => {
      const req = { params: { id: 'prod-1' } } as unknown as Request
      const mockTransactions = [{ id: 'tx-1', description: 'Test', amount: 100, date: new Date(), productId: 'prod-1' }]
      
      vi.mocked(mockUseCase.getProductTransactions).mockResolvedValue(mockTransactions)

      await controller.getTransaction(req, mockRes)

      expect(mockUseCase.getProductTransactions).toHaveBeenCalledWith('prod-1')
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith(mockTransactions)
    })

    it('should return 404 if product not found', async () => {
      const req = { params: { id: 'prod-1' } } as unknown as Request
      vi.mocked(mockUseCase.getProductTransactions).mockRejectedValue(new Error('Product not found'))

      await controller.getTransaction(req, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(404)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Product not found' })
    })

    it('should return 500 on unexpected error', async () => {
      const req = { params: { id: 'prod-1' } } as unknown as Request
      vi.mocked(mockUseCase.getProductTransactions).mockRejectedValue(new Error('Database fail'))

      await controller.getTransaction(req, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal Server Error' })
    })
  })
})