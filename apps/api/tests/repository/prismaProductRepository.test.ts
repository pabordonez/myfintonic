import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PrismaProductRepository } from '../../src/infrastructure/persistence/prisma/PrismaProductRepository'
import prisma from '../../src/infrastructure/persistence/prisma/client'

vi.mock('../../src/infrastructure/persistence/prisma/client', () => ({
  default: {
    financialProduct: {
      create: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

const repo = new PrismaProductRepository()

describe('PrismaProductRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should throw friendly error on P2025 (Entity not found)', async () => {
      const error: any = new Error('FK Error')
      error.code = 'P2025'
      vi.mocked(prisma.financialProduct.create).mockRejectedValue(error)

      await expect(repo.create({ 
        id: '1', clientId: 'c1', financialEntity: 'fe1', name: 'P', type: 'STOCKS', status: 'ACTIVE' 
      } as any)).rejects.toThrow("Financial Entity with ID 'fe1' not found")
    })

    it('should rethrow other errors', async () => {
      vi.mocked(prisma.financialProduct.create).mockRejectedValue(new Error('DB Error'))
      await expect(repo.create({ 
        id: '1', clientId: 'c1', financialEntity: 'fe1', name: 'P', type: 'STOCKS', status: 'ACTIVE' 
      } as any)).rejects.toThrow('DB Error')
    })
  })

  describe('update', () => {
    it('should handle date strings correctly', async () => {
      const dateStr = '2023-01-01T00:00:00.000Z'
      await repo.update('1', { initialDate: dateStr as any })
      
      expect(prisma.financialProduct.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          initialDate: new Date(dateStr)
        })
      }))
    })

    it('should throw friendly error on P2025', async () => {
      const error: any = new Error('FK Error')
      error.code = 'P2025'
      vi.mocked(prisma.financialProduct.update).mockRejectedValue(error)

      await expect(repo.update('1', { financialEntity: 'fe1' })).rejects.toThrow("Financial Entity with ID 'fe1' not found")
    })

    it('should create valueHistory if currentBalance changes', async () => {
      vi.mocked(prisma.financialProduct.findUnique).mockResolvedValue({ currentBalance: 100 } as any)
      vi.mocked(prisma.financialProduct.update).mockResolvedValue({} as any)
      await repo.update('1', { currentBalance: 200 })

      expect(prisma.financialProduct.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          valueHistory: {
            create: expect.objectContaining({
              value: 200,
              previousValue: 100
            })
          }
        })
      }))
    })

    it('should create valueHistory when updating currentBalance for FIXED_TERM_DEPOSIT', async () => {
      vi.mocked(prisma.financialProduct.findUnique).mockResolvedValue({
        id: '1',
        type: 'FIXED_TERM_DEPOSIT',
        currentBalance: 1000,
        initialBalance: 1000
      } as any)
      vi.mocked(prisma.financialProduct.update).mockResolvedValue({} as any)

      await repo.update('1', { currentBalance: 1050 })

      expect(prisma.financialProduct.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: '1' },
        data: expect.objectContaining({
          currentBalance: 1050,
          valueHistory: {
            create: expect.objectContaining({
              value: 1050,
              previousValue: 1000
            })
          }
        })
      }))
    })

    it('should map interestPaymentFrequency correctly', async () => {
      await repo.update('1', { interestPaymentFrequency: 'Monthly' } as any)
      
      expect(prisma.financialProduct.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          interestPaymentFreq: 'Monthly'
        })
      }))
    })
  })

  describe('mapToDomain', () => {
    // Helper para probar el mapeo de diferentes tipos
    const testMapping = async (type: string, extraFields: any) => {
      vi.mocked(prisma.financialProduct.findFirst).mockResolvedValue({
        id: '1',
        type,
        name: 'Test',
        financialEntityId: 'fe1',
        clientId: 'c1',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...extraFields
      } as any)

      const result = await repo.findById('1')
      return result
    }

    it('should map SAVINGS_ACCOUNT fields', async () => {
      const res = await testMapping('SAVINGS_ACCOUNT', { monthlyInterestRate: 0.05 })
      expect(res).toHaveProperty('monthlyInterestRate', 0.05)
    })

    it('should map FIXED_TERM_DEPOSIT fields', async () => {
      const res = await testMapping('FIXED_TERM_DEPOSIT', { annualInterestRate: 0.03 })
      expect(res).toHaveProperty('annualInterestRate', 0.03)
    })

    it('should map INVESTMENT_FUND fields', async () => {
      const res = await testMapping('INVESTMENT_FUND', { numberOfUnits: 10 })
      expect(res).toHaveProperty('numberOfUnits', 10)
    })

    it('should map STOCKS fields', async () => {
      const res = await testMapping('STOCKS', { numberOfShares: 100, currentMarketPrice: 50 })
      expect(res).toHaveProperty('numberOfShares', 100)
      expect(res).toHaveProperty('currentMarketPrice', 50)
    })

    it('should map CURRENT_ACCOUNT fields', async () => {
      const res = await testMapping('CURRENT_ACCOUNT', { transactions: [] })
      expect(res).toHaveProperty('transactions', [])
    })

    it('should map fees correctly', async () => {
      const res = await testMapping('INVESTMENT_FUND', { fees: { maintenance: 10 } })
      expect(res).toHaveProperty('fees', { maintenance: 10 })
    })
  })

  describe('findAll', () => {
    it('should apply filters', async () => {
      vi.mocked(prisma.financialProduct.findMany).mockResolvedValue([])
      await repo.findAll({ status: 'ACTIVE', financialEntity: 'Bank' } as any)
      expect(prisma.financialProduct.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ status: 'ACTIVE' })
      }))
    })
  })

  describe('delete', () => {
    it('should call delete', async () => {
      await repo.delete('1')
      expect(prisma.financialProduct.delete).toHaveBeenCalledWith({ where: { id: '1' } })
    })
  })
})