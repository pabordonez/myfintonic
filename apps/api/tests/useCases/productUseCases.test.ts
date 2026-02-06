import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProductUseCases } from '../../src/application/useCases/productUseCases'
import { IProductRepository } from '../../src/domain/repository/IProductRepository'
import { IProductFactory } from '../../src/domain/factories/productFactory'

const mockRepo = {
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
} as unknown as IProductRepository

const mockFactory = {
  create: vi.fn(),
  validateUpdate: vi.fn(),
} as unknown as IProductFactory

const useCases = new ProductUseCases(mockRepo, mockFactory)

describe('ProductUseCases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createProduct', () => {
    it('should throw if missing fields', async () => {
      await expect(useCases.createProduct({} as any)).rejects.toThrow('Missing required fields')
    })

    it('should create product if valid', async () => {
      const data = { name: 'P', type: 'T', financialEntity: 'F', status: 'S' } as any
      vi.mocked(mockFactory.create).mockReturnValue(data)
      await useCases.createProduct(data)
      expect(mockRepo.create).toHaveBeenCalledWith(data)
    })
  })

  describe('updateProduct', () => {
    it('should throw if product not found', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(null)
      await expect(useCases.updateProduct('1', {})).rejects.toThrow('Product not found')
    })

    it('should validate and update if found', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue({ type: 'T' } as any)
      await useCases.updateProduct('1', {})
      expect(mockFactory.validateUpdate).toHaveBeenCalled()
      expect(mockRepo.update).toHaveBeenCalled()
    })

    it('should allow updating currentBalance for FIXED_TERM_DEPOSIT', async () => {
      const existingProduct = {
        id: '1',
        type: 'FIXED_TERM_DEPOSIT',
        currentBalance: 1000,
        initialBalance: 1000
      }
      vi.mocked(mockRepo.findById).mockResolvedValue(existingProduct as any)

      await useCases.updateProduct('1', { currentBalance: 1050 })

      expect(mockFactory.validateUpdate).toHaveBeenCalled()
      expect(mockRepo.update).toHaveBeenCalledWith('1', { currentBalance: 1050 })
    })
  })

  describe('deleteProduct', () => {
    it('should throw if product not found', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(null)
      await expect(useCases.deleteProduct('1')).rejects.toThrow('Product not found')
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
      vi.mocked(mockRepo.findById).mockResolvedValue({ valueHistory: [] } as any)
      const res = await useCases.getProductHistory('1')
      expect(res).toEqual([])
    })

    it('should return empty array if history is undefined', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue({ valueHistory: undefined } as any)
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
