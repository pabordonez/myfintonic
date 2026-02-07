import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PrismaClientRepository } from '../../src/infrastructure/persistence/prisma/PrismaClientRepository'
import prisma from '../../src/infrastructure/persistence/prisma/client'
import { RegisterClientDto } from '../../src/application/dtos/client.dto'

// Mock de prisma
vi.mock('../../src/infrastructure/persistence/prisma/client', () => ({
  default: {
    client: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

const repository = new PrismaClientRepository()

describe('PrismaClientRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('findAll should call prisma.client.findMany', async () => {
    await repository.findAll()
    expect(prisma.client.findMany).toHaveBeenCalled()
  })

  it('findById should call prisma.client.findUnique', async () => {
    const id = '1'
    await repository.findById(id)
    expect(prisma.client.findUnique).toHaveBeenCalledWith({ where: { id } })
  })

  it('update should call prisma.client.update', async () => {
    const id = '1'
    const data = { firstName: 'Updated' }
    await repository.update(id, data)
    expect(prisma.client.update).toHaveBeenCalledWith({ where: { id }, data })
  })

  describe('create', () => {
    it('should create a client', async () => {
      const dto: RegisterClientDto = {
        email: 'test@test.com',
        password: '123',
        firstName: 'T',
        lastName: 'U',
      }
      vi.mocked(prisma.client.create).mockResolvedValue({
        id: '1',
        ...dto,
        role: 'USER',
      } as any)

      const result = await repository.create(dto)
      expect(result).toHaveProperty('id')
      expect(prisma.client.create).toHaveBeenCalled()
    })

    it('should throw "Email already in use" on P2002 error', async () => {
      const error: any = new Error('Unique constraint')
      error.code = 'P2002'
      vi.mocked(prisma.client.create).mockRejectedValue(error)

      const dto: RegisterClientDto = {
        email: 'test@test.com',
        password: '123',
        firstName: 'T',
        lastName: 'U',
      }
      await expect(repository.create(dto)).rejects.toThrow(
        'Email already in use'
      )
    })

    it('should rethrow other errors', async () => {
      const error = new Error('DB Error')
      vi.mocked(prisma.client.create).mockRejectedValue(error)

      const dto: RegisterClientDto = {
        email: 'test@test.com',
        password: '123',
        firstName: 'T',
        lastName: 'U',
      }
      await expect(repository.create(dto)).rejects.toThrow('DB Error')
    })
  })
})
