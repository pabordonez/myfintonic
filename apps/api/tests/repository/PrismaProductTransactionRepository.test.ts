import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PrismaProductTransactionRepository } from '../../src/infrastructure/persistence/prisma/repository/PrismaProductTransactionRepository'
import prisma from '../../src/infrastructure/persistence/prisma/repository/prismaClient'

// Mock Prisma client
vi.mock('@infrastructure/persistence/prisma/repository/prismaClient', () => ({
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
      const date = new Date()
      const transactionData = {
        id: 'tx1',
        productId: 'p1',
        description: 'test',
        amount: 50,
        date: date,
      }

      vi.mocked(prisma.productTransaction.create).mockResolvedValue(
        transactionData as any
      )

      await repo.addTransaction(transactionData as any)

      expect(prisma.productTransaction.create).toHaveBeenCalledWith({
        data: transactionData,
      })
    })
  })
})
