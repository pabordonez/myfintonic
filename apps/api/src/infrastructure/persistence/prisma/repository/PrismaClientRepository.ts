import { IClientRepository } from '@domain/repository/IClientRepository'
import prisma from '@infrastructure/persistence/prisma/repository/prismaClient'
import { Client } from '@domain/models/client'

export class PrismaClientRepository implements IClientRepository {
  async create(client: Client): Promise<Client> {
    try {
      const created = await prisma.client.create({
        data: {
          id: client.id,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          password: client.password,
          nickname: client.nickname,
          role: client.role,
          createdAt: client.createdAt,
          updatedAt: client.updatedAt,
        },
      })
      return this.mapToDomain(created)
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('Email already in use')
      }
      throw error
    }
  }

  async findAll(): Promise<Client[]> {
    const clients = await prisma.client.findMany()
    return clients.map((c) => this.mapToDomain(c))
  }

  async findById(id: string): Promise<Client | null> {
    const client = await prisma.client.findUnique({ where: { id } })
    return client ? this.mapToDomain(client) : null
  }

  async findByEmail(email: string): Promise<Client | null> {
    const client = await prisma.client.findUnique({ where: { email } })
    return client ? this.mapToDomain(client) : null
  }

  async update(client: Client): Promise<Client> {
    const updated = await prisma.client.update({
      where: { id: client.id },
      data: {
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        password: client.password,
        nickname: client.nickname,
        updatedAt: client.updatedAt,
      },
    })
    return this.mapToDomain(updated)
  }

  private mapToDomain(prismaClient: any): Client {
    return Client.fromPrimitives(prismaClient)
  }
}
