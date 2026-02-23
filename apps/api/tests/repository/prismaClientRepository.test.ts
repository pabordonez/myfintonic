import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PrismaClientRepository } from '../../src/infrastructure/persistence/prisma/repository/PrismaClientRepository'
import prisma from '../../src/infrastructure/persistence/prisma/repository/prismaClient'
import { Client } from '../../src/domain/models/client'

// Mock prisma
vi.mock('@infrastructure/persistence/prisma/repository/prismaClient', () => ({
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
    vi.mocked(prisma.client.findMany).mockResolvedValue([])
    await repository.findAll()
    expect(prisma.client.findMany).toHaveBeenCalled()
  })

  it('findById should call prisma.client.findUnique', async () => {
    const id = '1'
    await repository.findById(id)
    expect(prisma.client.findUnique).toHaveBeenCalledWith({ where: { id } })
  })

  it('update should call prisma.client.update', async () => {
    const client = Client.fromPrimitives({
      id: '1',
      firstName: 'Updated',
      lastName: 'User',
      email: 'test@test.com',
      password: 'hash',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    vi.mocked(prisma.client.update).mockResolvedValue({
      ...client,
      firstName: 'Updated',
    } as any)

    await repository.update(client)
    expect(prisma.client.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '1' },
        data: expect.objectContaining({ firstName: 'Updated' }),
      })
    )
  })

  describe('create', () => {
    it('should create a client', async () => {
      const client = Client.create(
        {
          email: 'test@test.com',
          password: '123',
          firstName: 'T',
          lastName: 'U',
          role: 'USER',
        },
        '1'
      )

      vi.mocked(prisma.client.create).mockResolvedValue({
        ...client,
        role: 'USER',
      } as any)

      const result = await repository.create(client)
      expect(result).toHaveProperty('id')
      expect(prisma.client.create).toHaveBeenCalled()
    })

    it('should throw "Email already in use" on P2002 error', async () => {
      const error: any = new Error('Unique constraint')
      error.code = 'P2002'
      vi.mocked(prisma.client.create).mockRejectedValue(error)

      const client = Client.create(
        {
          email: 'test@test.com',
          password: '123',
          firstName: 'T',
          lastName: 'U',
          role: 'USER',
        },
        '1'
      )

      await expect(repository.create(client)).rejects.toThrow(
        'Email already in use'
      )
    })

    it('should rethrow other errors', async () => {
      const error = new Error('DB Error')
      vi.mocked(prisma.client.create).mockRejectedValue(error)

      const client = Client.create(
        {
          email: 'test@test.com',
          password: '123',
          firstName: 'T',
          lastName: 'U',
          role: 'USER',
        },
        '1'
      )

      await expect(repository.create(client)).rejects.toThrow('DB Error')
    })
  })
})
