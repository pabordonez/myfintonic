import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PrismaFinancialEntityRepository } from '../../src/infrastructure/persistence/prisma/PrismaFinancialEntityRepository'
import prisma from '../../src/infrastructure/persistence/prisma/client'

vi.mock('../../src/infrastructure/persistence/prisma/client', () => ({
  default: {
    financialEntity: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      delete: vi.fn(),
    },
  },
}))

const repo = new PrismaFinancialEntityRepository()

describe('PrismaFinancialEntityRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('update should call prisma update', async () => {
    vi.mocked(prisma.financialEntity.update).mockResolvedValue({ id: '1', name: 'New' } as any)
    await repo.update('1', { name: 'New' })
    expect(prisma.financialEntity.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { name: 'New' },
    })
  })

  it('findAll should filter by name', async () => {
    vi.mocked(prisma.financialEntity.findMany).mockResolvedValue([])
    await repo.findAll({ name: 'Bank' })
    expect(prisma.financialEntity.findMany).toHaveBeenCalledWith({
      where: { name: 'Bank' },
    })
  })
})