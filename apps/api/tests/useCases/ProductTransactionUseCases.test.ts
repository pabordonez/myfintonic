import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProductTransactionUseCases } from '../../src/application/useCases/productTransactionUseCases'
import { IProductTransactionRepository } from '../../src/domain/repository/IProductTransactionRepository'
import { IProductRepository } from '../../src/domain/repository/IProductRepository'

describe('ProductTransactionUseCases', () => {
  let useCase: ProductTransactionUseCases
  let mockTransactionRepo: IProductTransactionRepository
  let mockProductRepo: IProductRepository

  beforeEach(() => {
    mockTransactionRepo = {
      addTransaction: vi.fn(),
      findAllByProductId: vi.fn(),
      findById: vi.fn(),
    }
    mockProductRepo = {
      findById: vi.fn(),
    } as unknown as IProductRepository

    useCase = new ProductTransactionUseCases(
      mockTransactionRepo,
      mockProductRepo
    )
  })

  describe('add', () => {
    it('should add transaction successfully', async () => {
      const request = {
        userId: 'user-1',
        productId: 'prod-1',
        description: 'Test',
        date: new Date(),
        amount: 100,
      }

      vi.mocked(mockProductRepo.findById).mockResolvedValue({
        id: 'prod-1',
        clientId: 'user-1',
        type: 'CURRENT_ACCOUNT',
        status: 'ACTIVE',
        currentBalance: 1000,
        name: 'Test Account',
        financialEntity: 'Bank',
      } as any)

      await useCase.add(request, 'uuid-123')

      expect(mockTransactionRepo.addTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'uuid-123',
          productId: 'prod-1',
          description: 'Test',
          date: request.date,
          amount: 100,
        })
      )
    })

    it('should throw error if product not found', async () => {
      vi.mocked(mockProductRepo.findById).mockResolvedValue(null)
      await expect(
        useCase.add({ userId: 'u1', productId: 'p1' } as any, 'uuid')
      ).rejects.toThrow('Product not found')
    })

    it('should throw error if user is not owner', async () => {
      vi.mocked(mockProductRepo.findById).mockResolvedValue({
        id: 'p1',
        clientId: 'other-user',
        type: 'CURRENT_ACCOUNT',
        currentBalance: 500,
        name: 'Test Account',
        financialEntity: 'Bank',
      } as any)
      await expect(
        useCase.add({ userId: 'u1', productId: 'p1' } as any, 'uuid')
      ).rejects.toThrow('Unauthorized access to product')
    })

    it('should throw error if product type is invalid', async () => {
      vi.mocked(mockProductRepo.findById).mockResolvedValue({
        id: 'p1',
        clientId: 'u1',
        type: 'STOCKS',
        numberOfShares: 10,
        unitPurchasePrice: 100,
        currentMarketPrice: 120,
        initialBalance: 1000,
        currentBalance: 1200,
        name: 'Tesla',
        status: 'ACTIVE',
        financialEntity: 'Bank',
      } as any)
      await expect(
        useCase.add({ userId: 'u1', productId: 'p1' } as any, 'uuid')
      ).rejects.toThrow('Transactions are not allowed')
    })

    it('should throw error if product is not active', async () => {
      vi.mocked(mockProductRepo.findById).mockResolvedValue({
        id: 'p1',
        clientId: 'u1',
        type: 'CURRENT_ACCOUNT',
        status: 'INACTIVE',
        currentBalance: 1000,
        name: 'Test Account',
        financialEntity: 'Bank',
      } as any)
      await expect(
        useCase.add(
          {
            userId: 'u1',
            productId: 'p1',
            description: 'Test',
            date: new Date(),
            amount: 100,
          } as any,
          'uuid'
        )
      ).rejects.toThrow('Transaction failed: Product is not active')
    })
  })

  describe('getProductTransactions', () => {
    it('should return transactions', async () => {
      vi.mocked(mockProductRepo.findById).mockResolvedValue({ id: 'p1' } as any)
      const txs = [{ id: 'tx1' }] as any
      vi.mocked(mockTransactionRepo.findAllByProductId).mockResolvedValue(txs)

      const result = await useCase.getProductTransactions('p1')
      expect(result).toBe(txs)
    })

    it('should throw error if product not found', async () => {
      vi.mocked(mockProductRepo.findById).mockResolvedValue(null)
      await expect(useCase.getProductTransactions('p1')).rejects.toThrow(
        'Product not found'
      )
    })
  })
})
