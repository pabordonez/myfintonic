import { IClientFinancialEntity } from '@domain/entities/IClientFinancialEntity'
import { IClientFinancialEntityRepository } from '@domain/repository/IClientFinancialEntityRepository'
import prisma from '@infrastructure/persistence/prisma/repository/prismaClient'

export class PrismaClientFinancialEntityRepository implements IClientFinancialEntityRepository {
  async create(
    clientFinancialEntity: Partial<IClientFinancialEntity>
  ): Promise<IClientFinancialEntity> {
    try {
      // Construimos el objeto data dinámicamente para evitar pasar 'undefined' en relaciones
      const data: any = {
        clientId: clientFinancialEntity.clientId,
        financialEntityId: clientFinancialEntity.financialEntityId,
        balance:
          clientFinancialEntity.balance !== null &&
          clientFinancialEntity.balance !== undefined
            ? clientFinancialEntity.balance
            : null,
        initialBalance:
          clientFinancialEntity.initialBalance !== null &&
          clientFinancialEntity.initialBalance !== undefined
            ? clientFinancialEntity.initialBalance
            : clientFinancialEntity.balance !== null &&
                clientFinancialEntity.balance !== undefined
              ? clientFinancialEntity.balance
              : null,
      }

      if (
        clientFinancialEntity.balance !== null &&
        clientFinancialEntity.balance !== undefined
      ) {
        data.valueHistory = {
          create: {
            date: new Date(),
            value: clientFinancialEntity.balance,
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
        const { clientId, financialEntityId } = clientFinancialEntity
        if (!clientId || !financialEntityId) {
          throw error
        }

        // 1. Verificar si existe y está ACTIVO
        const existingActive = await prisma.clientFinancialEntity.findFirst({
          where: {
            clientId,
            financialEntityId,
          },
        })

        if (existingActive) throw error // Está activo -> Dejar que falle con 409

        // 2. Si llegamos aquí, existe pero está borrado -> RESTAURAR
        const updateData: any = {
          deletedAt: null,
        }

        if (
          clientFinancialEntity.balance !== null &&
          clientFinancialEntity.balance !== undefined
        ) {
          updateData.balance = clientFinancialEntity.balance
          updateData.valueHistory = {
            create: {
              date: new Date(),
              value: clientFinancialEntity.balance,
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

  async update(
    id: string,
    entity: Partial<IClientFinancialEntity>
  ): Promise<void> {
    const data: any = {}

    if (entity.balance !== undefined) {
      // Obtener el valor anterior para el histórico
      const currentEntity = await prisma.clientFinancialEntity.findUnique({
        where: { id },
      })
      const previousValue = currentEntity?.balance

      data.balance = entity.balance !== null ? entity.balance : null
      if (entity.balance !== null && entity.balance !== undefined) {
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
      where: { id },
      data,
    })
  }

  async findById(id: string): Promise<IClientFinancialEntity | null> {
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

  async findAllWithClients(): Promise<IClientFinancialEntity[]> {
    const entities = await prisma.clientFinancialEntity.findMany({
      include: {
        financialEntity: true,
        client: true,
      },
    })
    return entities.map((e: any) => this.mapToDomain(e))
  }

  async findAll(
    filters?: Partial<IClientFinancialEntity> & { name?: string }
  ): Promise<IClientFinancialEntity[]> {
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

  private mapToDomain(prismaEntity: any): IClientFinancialEntity {
    return {
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
    }
  }
}
