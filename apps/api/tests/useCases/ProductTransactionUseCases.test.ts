import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProductTransactionUseCases } from '../../src/application/useCases/ProductTransactionUseCases'
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

    useCase = new ProductTransactionUseCases(mockTransactionRepo, mockProductRepo)
  })

  describe('add', () => {
    it('should add transaction successfully', async () => {
      const request = {
        userId: 'user-1',
        productId: 'prod-1',
        description: 'Test',
        date: new Date(),
        amount: 100
      }

      vi.mocked(mockProductRepo.findById).mockResolvedValue({
        id: 'prod-1',
        clientId: 'user-1',
        type: 'CURRENT_ACCOUNT'
      } as any)

      await useCase.add(request)

      expect(mockTransactionRepo.addTransaction).toHaveBeenCalledWith({
        productId: 'prod-1',
        description: 'Test',
        date: request.date,
        amount: 100
      })
    })

    it('should throw error if product not found', async () => {
      vi.mocked(mockProductRepo.findById).mockResolvedValue(null)
      await expect(useCase.add({ userId: 'u1', productId: 'p1' } as any))
        .rejects.toThrow('Product not found')
    })

    it('should throw error if user is not owner', async () => {
      vi.mocked(mockProductRepo.findById).mockResolvedValue({
        id: 'p1',
        clientId: 'other-user',
        type: 'CURRENT_ACCOUNT'
      } as any)
      await expect(useCase.add({ userId: 'u1', productId: 'p1' } as any))
        .rejects.toThrow('Unauthorized access to product')
    })

    it('should throw error if product type is invalid', async () => {
      vi.mocked(mockProductRepo.findById).mockResolvedValue({
        id: 'p1',
        clientId: 'u1',
        type: 'STOCKS'
      } as any)
      await expect(useCase.add({ userId: 'u1', productId: 'p1' } as any))
        .rejects.toThrow('Transactions are not allowed')
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
      await expect(useCase.getProductTransactions('p1'))
        .rejects.toThrow('Product not found')
    })
  })
})