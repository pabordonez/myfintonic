import { IClientFinancialEntityRepository } from '@domain/repository/IClientFinancialEntityRepository'
import prisma from '@infrastructure/persistence/prisma/repository/prismaClient'
import { ClientFinancialEntity } from '@domain/factories/clientFinancialEntity'

export class PrismaClientFinancialEntityRepository implements IClientFinancialEntityRepository {
  async create(entity: ClientFinancialEntity): Promise<ClientFinancialEntity> {
    try {
      const data: any = {
        id: entity.id,
        clientId: entity.clientId,
        financialEntityId: entity.financialEntityId,
        balance: entity.balance,
        initialBalance: entity.initialBalance ?? entity.balance,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      }

      if (entity.balance !== undefined) {
        data.valueHistory = {
          create: {
            date: new Date(),
            value: entity.balance,
          },
        }
      }

      const created = await prisma.clientFinancialEntity.create({
        data: data,
        include: {
          valueHistory: true,
          client: true,
          financialEntity: true,
        },
      })

      return this.mapToDomain(created)
    } catch (error: any) {
      // Si ya existe (activo o borrado), lo reactivamos y actualizamos
      if (error.code === 'P2002') {
        const { clientId, financialEntityId } = entity
        if (!clientId || !financialEntityId) {
          throw error
        }

        // 1. Verify if exist and ACTIVE
        const existingActive = await prisma.clientFinancialEntity.findFirst({
          where: {
            clientId,
            financialEntityId,
          },
        })

        if (existingActive) throw error

        // 2. If we reach here, it exists but is deleted -> RESTORE
        const updateData: any = {
          deletedAt: null,
        }

        if (entity.balance !== undefined) {
          updateData.balance = entity.balance
          updateData.valueHistory = {
            create: {
              date: new Date(),
              value: entity.balance,
            },
          }
        }

        const updated = await prisma.clientFinancialEntity.update({
          where: {
            clientId_financialEntityId: {
              clientId,
              financialEntityId,
            },
          },
          data: updateData,
          include: {
            financialEntity: true,
            valueHistory: true,
            client: true,
          },
        })

        return this.mapToDomain(updated)
      }
      throw error
    }
  }

  async update(entity: ClientFinancialEntity): Promise<void> {
    const data: any = {}

    if (entity.balance !== undefined) {
      const currentEntity = await prisma.clientFinancialEntity.findUnique({
        where: { id: entity.id },
      })
      const previousValue = currentEntity?.balance

      data.balance = entity.balance
      if (entity.balance !== undefined) {
        data.valueHistory = {
          create: {
            date: new Date(),
            value: entity.balance,
            previousValue: previousValue,
          },
        }
      }
    }

    await prisma.clientFinancialEntity.update({
      where: { id: entity.id },
      data,
    })
  }

  async findById(id: string): Promise<ClientFinancialEntity | null> {
    const entity = await prisma.clientFinancialEntity.findFirst({
      where: { id },
      include: {
        valueHistory: true,
        financialEntity: true,
        client: true,
      },
    })
    if (!entity) return null
    return this.mapToDomain(entity)
  }

  async findAllWithClients(): Promise<ClientFinancialEntity[]> {
    const entities = await prisma.clientFinancialEntity.findMany({
      include: {
        financialEntity: true,
        client: true,
      },
    })
    return entities.map((e: any) => this.mapToDomain(e))
  }

  async findAll(filters?: {
    clientId?: string
    financialEntityId?: string
    name?: string
  }): Promise<ClientFinancialEntity[]> {
    const where: any = {}
    if (filters?.clientId) where.clientId = filters.clientId
    if (filters?.financialEntityId)
      where.financialEntityId = filters.financialEntityId
    if (filters?.name) where.financialEntity = { name: filters.name }

    const entities = await prisma.clientFinancialEntity.findMany({
      where,
      include: { financialEntity: true },
    })
    return entities.map((e: any) => this.mapToDomain(e))
  }

  async delete(id: string): Promise<void> {
    await prisma.clientFinancialEntity.delete({ where: { id } })
  }

  private mapToDomain(prismaEntity: any): ClientFinancialEntity {
    return ClientFinancialEntity.fromPrimitives({
      id: prismaEntity.id,
      balance: prismaEntity.balance ? Number(prismaEntity.balance) : 0,
      initialBalance: prismaEntity.initialBalance
        ? Number(prismaEntity.initialBalance)
        : undefined,
      clientId: prismaEntity.clientId,
      client: prismaEntity.client
        ? {
            id: prismaEntity.client.id,
            firstName: prismaEntity.client.firstName,
            lastName: prismaEntity.client.lastName,
            email: prismaEntity.client.email,
            nickname: prismaEntity.client.nickname,
          }
        : undefined,
      financialEntityId: prismaEntity.financialEntityId,
      financialEntity: prismaEntity.financialEntity
        ? {
            id: prismaEntity.financialEntity.id,
            name: prismaEntity.financialEntity.name,
            createdAt: prismaEntity.financialEntity.createdAt,
            updatedAt: prismaEntity.financialEntity.updatedAt,
          }
        : undefined,
      createdAt: prismaEntity.createdAt,
      updatedAt: prismaEntity.updatedAt,
      valueHistory:
        prismaEntity.valueHistory?.map((h: any) => ({
          id: h.id,
          date: h.date,
          value: Number(h.value),
          previousValue: h.previousValue ? Number(h.previousValue) : undefined,
          clientFinancialEntityId: h.clientFinancialEntityId,
        })) || [],
    })
  }
}
