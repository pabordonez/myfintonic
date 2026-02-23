import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PrismaClientFinancialEntityRepository } from '../../src/infrastructure/persistence/prisma/repository/PrismaClientFinancialEntityRepository'
import prisma from '../../src/infrastructure/persistence/prisma/repository/prismaClient'
import { ClientFinancialEntity } from '../../src/domain/models/clientFinancialEntity'

vi.mock('@infrastructure/persistence/prisma/repository/prismaClient', () => ({
  default: {
    clientFinancialEntity: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

const repo = new PrismaClientFinancialEntityRepository()

describe('PrismaClientFinancialEntityRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should create successfully', async () => {
      vi.mocked(prisma.clientFinancialEntity.create).mockResolvedValue({
        id: '1',
        balance: 100,
        clientId: 'c1',
        financialEntityId: 'f1',
        financialEntity: { id: 'f1', name: 'Bank' },
        valueHistory: [],
      } as any)

      await repo.create(
        ClientFinancialEntity.fromPrimitives({
          clientId: 'c1',
          financialEntityId: 'f1',
          balance: 100,
        } as any)
      )
      expect(prisma.clientFinancialEntity.create).toHaveBeenCalled()
    })

    it('should handle P2002 and restore if deleted', async () => {
      const error: any = new Error('Unique constraint')
      error.code = 'P2002'
      vi.mocked(prisma.clientFinancialEntity.create).mockRejectedValue(error)

      // Mock findFirst to return null (meaning not active)
      vi.mocked(prisma.clientFinancialEntity.findFirst).mockResolvedValue(null)

      vi.mocked(prisma.clientFinancialEntity.update).mockResolvedValue({
        id: '1',
        balance: 100,
        clientId: 'c1',
        financialEntityId: 'f1',
        financialEntity: { id: 'f1', name: 'Bank' },
        valueHistory: [],
      } as any)

      await repo.create(
        ClientFinancialEntity.fromPrimitives({
          clientId: 'c1',
          financialEntityId: 'f1',
          balance: 100,
        } as any)
      )

      expect(prisma.clientFinancialEntity.findFirst).toHaveBeenCalled()
      expect(prisma.clientFinancialEntity.update).toHaveBeenCalled()
    })

    it('should throw P2002 if active exists', async () => {
      const error: any = new Error('Unique constraint')
      error.code = 'P2002'
      vi.mocked(prisma.clientFinancialEntity.create).mockRejectedValue(error)

      // Mock findFirst to return existing (meaning active)
      vi.mocked(prisma.clientFinancialEntity.findFirst).mockResolvedValue({
        id: '1',
      } as any)

      await expect(
        repo.create(
          ClientFinancialEntity.fromPrimitives({
            clientId: 'c1',
            financialEntityId: 'f1',
            balance: 100,
          } as any)
        )
      ).rejects.toThrow('Unique constraint')
    })

    it('should default initialBalance to balance if not provided', async () => {
      vi.mocked(prisma.clientFinancialEntity.create).mockResolvedValue({
        id: '1',
        balance: 100,
        initialBalance: 100,
        clientId: 'c1',
        financialEntityId: 'f1',
        financialEntity: { id: 'f1', name: 'Bank' },
        valueHistory: [],
      } as any)

      await repo.create(
        ClientFinancialEntity.fromPrimitives({
          clientId: 'c1',
          financialEntityId: 'f1',
          balance: 100,
        } as any)
      )

      expect(prisma.clientFinancialEntity.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            initialBalance: 100,
          }),
        })
      )
    })

    it('should handle creation with null/undefined balance', async () => {
      vi.mocked(prisma.clientFinancialEntity.create).mockResolvedValue({
        id: '1',
        balance: 0,
        clientId: 'c1',
        financialEntityId: 'f1',
        financialEntity: { id: 'f1', name: 'Bank' },
        valueHistory: [],
      } as any)

      await repo.create(
        ClientFinancialEntity.fromPrimitives({
          clientId: 'c1',
          financialEntityId: 'f1',
          balance: undefined,
        } as any)
      )

      expect(prisma.clientFinancialEntity.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            balance: 0,
            initialBalance: 0,
          }),
        })
      )
    })

    it('should rethrow generic errors', async () => {
      const error = new Error('DB Error')
      vi.mocked(prisma.clientFinancialEntity.create).mockRejectedValue(error)

      await expect(
        repo.create(
          ClientFinancialEntity.fromPrimitives({
            clientId: 'c1',
            financialEntityId: 'f1',
            balance: 100,
          } as any)
        )
      ).rejects.toThrow('DB Error')
    })
  })

  describe('update', () => {
    it('should update balance and create history', async () => {
      vi.mocked(prisma.clientFinancialEntity.findUnique).mockResolvedValue({
        balance: 50,
      } as any)
      vi.mocked(prisma.clientFinancialEntity.update).mockResolvedValue({
        id: '1',
      } as any)

      await repo.update(
        ClientFinancialEntity.fromPrimitives({
          id: '1',
          balance: 100,
          clientId: 'c1',
          financialEntityId: 'f1',
        } as any)
      )

      expect(prisma.clientFinancialEntity.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' },
          data: expect.objectContaining({
            balance: 100,
            valueHistory: {
              create: expect.objectContaining({
                value: 100,
                previousValue: 50,
              }),
            },
          }),
        })
      )
    })
  })

  describe('findById', () => {
    it('should return null if not found', async () => {
      vi.mocked(prisma.clientFinancialEntity.findFirst).mockResolvedValue(null)
      const result = await repo.findById('1')
      expect(result).toBeNull()
    })

    it('should return entity if found', async () => {
      const mockEntity = {
        id: '1',
        balance: 100,
        clientId: 'c1',
        financialEntityId: 'f1',
        financialEntity: { id: 'f1', name: 'Bank' },
        valueHistory: [{ id: 'vh1', date: new Date(), value: 100 }],
      }
      vi.mocked(prisma.clientFinancialEntity.findFirst).mockResolvedValue(
        mockEntity as any
      )
      const result = await repo.findById('1')
      expect(result).toEqual(expect.objectContaining({ id: '1', balance: 100 }))
      expect(result?.valueHistory).toHaveLength(1)
    })
  })

  describe('findAll', () => {
    it('should apply filters', async () => {
      vi.mocked(prisma.clientFinancialEntity.findMany).mockResolvedValue([])
      await repo.findAll({ clientId: 'c1', name: 'Bank' })
      expect(prisma.clientFinancialEntity.findMany).toHaveBeenCalled()
    })

    it('should return mapped entities', async () => {
      const mockEntity = {
        id: '1',
        balance: 100,
        clientId: 'c1',
        financialEntityId: 'f1',
        financialEntity: { id: 'f1', name: 'Bank' },
        valueHistory: [],
      }
      vi.mocked(prisma.clientFinancialEntity.findMany).mockResolvedValue([
        mockEntity,
      ] as any)
      const result = await repo.findAll()
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })
  })

  describe('findAllWithClients', () => {
    it('should return entities with client included', async () => {
      const mockEntity = {
        id: '1',
        balance: 100,
        clientId: 'c1',
        financialEntityId: 'f1',
        financialEntity: { id: 'f1', name: 'Bank' },
        client: {
          id: 'c1',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@test.com',
        },
        valueHistory: [],
      }
      vi.mocked(prisma.clientFinancialEntity.findMany).mockResolvedValue([
        mockEntity,
      ] as any)

      const result = await (repo as any).findAllWithClients()

      expect(prisma.clientFinancialEntity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({ client: true }),
        })
      )
      expect(result).toHaveLength(1)
    })
  })

  describe('delete', () => {
    it('should call delete', async () => {
      await repo.delete('1')
      expect(prisma.clientFinancialEntity.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      })
    })
  })
})
