import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProductTransactionController } from '../../src/infrastructure/http/controllers/productTransactionController_tmp'
import { ProductTransactionUseCases } from '../../src/application/useCases/productTransactionUseCases_tmp'
import { Request, Response, NextFunction } from 'express'

// Mock use case
const mockUseCase = {
  add: vi.fn(),
  getProductTransactions: vi.fn(),
} as unknown as ProductTransactionUseCases

// Mock Express Response
const mockRes = {
  status: vi.fn().mockReturnThis(),
  json: vi.fn(),
} as unknown as Response

// Mock NextFunction
const next = vi.fn() as unknown as NextFunction

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
          amount: 100,
        },
      } as unknown as Request

      vi.mocked(mockUseCase.add).mockResolvedValue(undefined)

      await controller.addTransaction(req, mockRes, next)

      expect(mockUseCase.add).toHaveBeenCalledWith(
        {
          userId: 'user-1',
          productId: 'prod-1',
          description: 'Test Transaction',
          date: expect.any(Date),
          amount: 100,
        },
        expect.any(String)
      )
      expect(mockRes.status).toHaveBeenCalledWith(201)
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Transaction added successfully',
      })
    })

    it('should return 401 if user is not authenticated', async () => {
      const req = {
        params: { id: 'prod-1' },
        user: undefined, // No user
        body: {},
      } as unknown as Request

      await controller.addTransaction(req, mockRes, next)

      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
    })

    it('should call next with error if validation fails (Zod)', async () => {
      const req = {
        params: { id: 'prod-1' },
        user: { id: 'user-1' },
        body: {
          // Missing description and amount
          date: 'invalid-date',
        },
      } as unknown as Request

      await controller.addTransaction(req, mockRes, next)

      expect(next).toHaveBeenCalled()
      expect((next as any).mock.calls[0][0].name).toBe('ZodError')
    })

    it('should call next with error if product not found', async () => {
      const req = {
        params: { id: 'prod-1' },
        user: { id: 'user-1' },
        body: {
          description: 'Test',
          date: new Date().toISOString(),
          amount: 100,
        },
      } as unknown as Request

      const error = new Error('Product not found')
      vi.mocked(mockUseCase.add).mockRejectedValue(error)

      await controller.addTransaction(req, mockRes, next)

      expect(next).toHaveBeenCalledWith(error)
    })

    it('should call next with error if unauthorized access to product', async () => {
      const req = {
        params: { id: 'prod-1' },
        user: { id: 'user-1' },
        body: {
          description: 'Test',
          date: new Date().toISOString(),
          amount: 100,
        },
      } as unknown as Request

      const error = new Error('Unauthorized access to product')
      vi.mocked(mockUseCase.add).mockRejectedValue(error)

      await controller.addTransaction(req, mockRes, next)

      expect(next).toHaveBeenCalledWith(error)
    })

    it('should call next with error on unexpected error', async () => {
      const req = {
        params: { id: 'prod-1' },
        user: { id: 'user-1' },
        body: {
          description: 'Test',
          date: new Date().toISOString(),
          amount: 100,
        },
      } as unknown as Request

      const error = new Error('Boom')
      vi.mocked(mockUseCase.add).mockRejectedValue(error)

      await controller.addTransaction(req, mockRes, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('getTransaction', () => {
    it('should return 200 and transactions list', async () => {
      const req = { params: { id: 'prod-1' } } as unknown as Request
      const mockTransactions = [
        {
          id: 'tx-1',
          description: 'Test',
          amount: 100,
          date: new Date(),
          productId: 'prod-1',
        },
      ]

      vi.mocked(mockUseCase.getProductTransactions).mockResolvedValue(
        mockTransactions
      )

      await controller.getTransaction(req, mockRes, next)

      expect(mockUseCase.getProductTransactions).toHaveBeenCalledWith('prod-1')
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith(mockTransactions)
    })

    it('should call next with error if product not found', async () => {
      const req = { params: { id: 'prod-1' } } as unknown as Request
      const error = new Error('Product not found')
      vi.mocked(mockUseCase.getProductTransactions).mockRejectedValue(error)

      await controller.getTransaction(req, mockRes, next)

      expect(next).toHaveBeenCalledWith(error)
    })

    it('should call next with error on unexpected error', async () => {
      const req = { params: { id: 'prod-1' } } as unknown as Request
      const error = new Error('Database fail')
      vi.mocked(mockUseCase.getProductTransactions).mockRejectedValue(error)

      await controller.getTransaction(req, mockRes, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })
})
