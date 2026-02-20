import { IClientRepository } from '@domain/repository/IClientRepository'
import prisma from '@infrastructure/persistence/prisma/repository/prismaClient'
import { IClient } from '@domain/entities/IClient'

export class PrismaClientRepository implements IClientRepository {
  async create(data: IClient) {
    try {
      return await prisma.client.create({
        data: {
          ...data,
          role: 'USER',
        },
      })
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('Email already in use')
      }
      throw error
    }
  }

  async findAll() {
    return prisma.client.findMany()
  }

  async findById(id: string) {
    return prisma.client.findUnique({ where: { id } })
  }

  async findByEmail(email: string) {
    return prisma.client.findUnique({ where: { email } })
  }

  async update(id: string, data: Partial<IClient>) {
    return prisma.client.update({
      where: { id },
      data,
    })
  }
}
