import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProductUseCases } from '../../src/application/useCases/productUseCases'
import { IProductRepository } from '../../src/domain/repository/IProductRepository'
import { FinancialProductFactory } from '../../src/domain/factories/financialProductFactory'

const mockRepo = {
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
} as unknown as IProductRepository

const useCases = new ProductUseCases(mockRepo)

describe('ProductUseCases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createProduct', () => {
    it('should throw if missing fields', async () => {
      vi.spyOn(FinancialProductFactory, 'create').mockImplementationOnce(() => {
        throw new Error('Missing required fields')
      })
      await expect(
        useCases.createProduct({} as any, 'test-uuid')
      ).rejects.toThrow('Missing required fields')
    })

    it('should create product if valid', async () => {
      const data = {
        name: 'P',
        type: 'T',
        financialEntity: 'F',
        status: 'S',
      } as any
      vi.spyOn(FinancialProductFactory, 'create').mockReturnValue(data)
      await useCases.createProduct(data, 'test-uuid')
      expect(mockRepo.create).toHaveBeenCalledWith(data)
    })
  })

  describe('updateProduct', () => {
    it('should throw if product not found', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(null)
      await expect(useCases.updateProduct('1', {})).rejects.toThrow(
        'Product not found'
      )
    })

    it('should validate and update if found', async () => {
      const mockProduct = {
        type: 'CURRENT_ACCOUNT',
        update: vi.fn().mockReturnValue({ type: 'T' }),
      }
      vi.mocked(mockRepo.findById).mockResolvedValue(mockProduct as any)

      const fromPrimitivesSpy = vi
        .spyOn(FinancialProductFactory, 'fromPrimitives')
        .mockReturnValue(mockProduct as any)

      await useCases.updateProduct('1', {})
      expect(mockRepo.update).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({ type: 'T' })
      )
      fromPrimitivesSpy.mockRestore()
    })

    it('should allow updating currentBalance for FIXED_TERM_DEPOSIT', async () => {
      // Simulamos una entidad real o un mock con el método update
      const existingProduct = {
        id: '1',
        type: 'FIXED_TERM_DEPOSIT',
        currentBalance: 1000,
        initialBalance: 1000,
        update: vi.fn().mockReturnValue({ currentBalance: 1050 }),
      }
      vi.mocked(mockRepo.findById).mockResolvedValue(existingProduct as any)

      const fromPrimitivesSpy = vi
        .spyOn(FinancialProductFactory, 'fromPrimitives')
        .mockReturnValue(existingProduct as any)

      await useCases.updateProduct('1', { currentBalance: 1050 })

      expect(existingProduct.update).toHaveBeenCalledWith({
        currentBalance: 1050,
      })
      expect(mockRepo.update).toHaveBeenCalledWith('1', {
        currentBalance: 1050,
      })

      fromPrimitivesSpy.mockRestore()
    })
  })

  describe('deleteProduct', () => {
    it('should throw if product not found', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(null)
      await expect(useCases.deleteProduct('1')).rejects.toThrow(
        'Product not found'
      )
    })

    it('should delete if found', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue({} as any)
      await useCases.deleteProduct('1')
      expect(mockRepo.delete).toHaveBeenCalledWith('1')
    })
  })

  describe('getProductHistory', () => {
    it('should return null if product not found', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(null)
      const res = await useCases.getProductHistory('1')
      expect(res).toBeNull()
    })

    it('should return history if found', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue({
        valueHistory: [],
      } as any)
      const res = await useCases.getProductHistory('1')
      expect(res).toEqual([])
    })

    it('should return empty array if history is undefined', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue({
        valueHistory: undefined,
      } as any)
      const res = await useCases.getProductHistory('1')
      expect(res).toEqual([])
    })
  })

  describe('getProducts', () => {
    it('should call repository.findAll', async () => {
      await useCases.getProducts({})
      expect(mockRepo.findAll).toHaveBeenCalled()
    })
  })

  describe('getProductById', () => {
    it('should call repository.findById', async () => {
      await useCases.getProductById('1')
      expect(mockRepo.findById).toHaveBeenCalledWith('1')
    })
  })
})
