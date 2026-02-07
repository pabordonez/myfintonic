import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PrismaProductTransactionRepository } from '../../src/infrastructure/persistence/prisma/PrismaProductTransactionRepository'
import prisma from '../../src/infrastructure/persistence/prisma/client'

// Mock del cliente de Prisma
vi.mock('../../src/infrastructure/persistence/prisma/client', () => ({
  default: {
    productTransaction: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    financialProduct: {
      findUniqueOrThrow: vi.fn(),
      update: vi.fn(),
    },
    valueHistory: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

describe('PrismaProductTransactionRepository', () => {
  let repo: PrismaProductTransactionRepository

  beforeEach(() => {
    vi.clearAllMocks()
    repo = new PrismaProductTransactionRepository()
  })

  describe('findById', () => {
    it('should return null if not found', async () => {
      vi.mocked(prisma.productTransaction.findUnique).mockResolvedValue(null)
      const result = await repo.findById('1')
      expect(result).toBeNull()
    })

    it('should return mapped domain entity', async () => {
      const dbTx = {
        id: '1',
        productId: 'p1',
        description: 'desc',
        date: new Date(),
        amount: 100,
      }
      vi.mocked(prisma.productTransaction.findUnique).mockResolvedValue(
        dbTx as any
      )
      const result = await repo.findById('1')
      expect(result).toEqual({
        id: '1',
        description: 'desc',
        date: dbTx.date,
        amount: 100,
      })
    })
  })

  describe('findAllByProductId', () => {
    it('should return list of transactions', async () => {
      const dbTx = {
        id: '1',
        productId: 'p1',
        description: 'd',
        date: new Date(),
        amount: 50,
      }
      vi.mocked(prisma.productTransaction.findMany).mockResolvedValue([
        dbTx,
      ] as any)

      const result = await repo.findAllByProductId('p1')
      expect(result).toHaveLength(1)
      expect(result[0].amount).toBe(50)
    })
  })

  describe('addTransaction', () => {
    it('should execute transaction successfully', async () => {
      // Mock del objeto transacción que Prisma pasa al callback
      const mockTx = {
        financialProduct: {
          findUniqueOrThrow: vi.fn().mockResolvedValue({
            currentBalance: 100,
            type: 'CURRENT_ACCOUNT',
          }),
          update: vi.fn(),
        },
        productTransaction: {
          create: vi.fn().mockResolvedValue({
            id: 'tx1',
            productId: 'p1',
            description: 'test',
            amount: 50,
            date: new Date(),
          }),
        },
        valueHistory: {
          create: vi.fn(),
        },
      }

      // Simulamos que $transaction ejecuta el callback pasándole nuestro mockTx
      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
        return cb(mockTx)
      })

      const params = {
        productId: 'p1',
        description: 'test',
        amount: 50,
        date: new Date(),
      }
      await repo.addTransaction(params)

      expect(mockTx.financialProduct.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'p1' },
      })
      expect(mockTx.productTransaction.create).toHaveBeenCalled()
    })

    it('should update balance and history for STOCKS', async () => {
      const mockTx = {
        financialProduct: {
          findUniqueOrThrow: vi.fn().mockResolvedValue({
            currentBalance: 100,
            type: 'STOCKS',
          }),
          update: vi.fn(),
        },
        productTransaction: {
          create: vi.fn().mockResolvedValue({
            id: 'tx1',
            productId: 'p1',
            description: 'buy',
            amount: 50,
            date: new Date(),
          }),
        },
        valueHistory: {
          create: vi.fn(),
        },
      }

      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
        return cb(mockTx)
      })

      await repo.addTransaction({
        productId: 'p1',
        description: 'buy',
        amount: 50,
        date: new Date(),
      })

      expect(mockTx.financialProduct.update).toHaveBeenCalled()
      expect(mockTx.valueHistory.create).toHaveBeenCalled()
    })
  })
})
