import { IFinancialEntityRepository } from '@domain/repository/IFinancialEntityRepository'
import prisma from '@infrastructure/persistence/prisma/repository/prismaClient'
import { Prisma } from '@prisma/client'
import { FinancialEntity } from '@domain/factories/financialEntity'

export class PrismaFinancialEntityRepository implements IFinancialEntityRepository {
  async create(financialEntity: FinancialEntity): Promise<FinancialEntity> {
    const created = await prisma.financialEntity.create({
      data: {
        id: financialEntity.id,
        name: financialEntity.name,
        createdAt: financialEntity.createdAt,
        updatedAt: financialEntity.updatedAt ?? undefined,
      },
    })
    return this.mapToDomain(created)
  }

  async update(id: string, entity: FinancialEntity): Promise<void> {
    const data: Prisma.FinancialEntityUpdateInput = {}

    if (entity.name !== undefined) data.name = entity.name
    data.updatedAt = entity.updatedAt ?? new Date()

    await prisma.financialEntity.update({
      where: { id },
      data,
    })
  }

  async findById(id: string): Promise<FinancialEntity | null> {
    const entity = await prisma.financialEntity.findUnique({
      where: { id },
    })
    if (!entity) return null
    return this.mapToDomain(entity)
  }

  async findAll(filters?: { name?: string }): Promise<FinancialEntity[]> {
    const where: Prisma.FinancialEntityWhereInput = {}
    if (filters?.name) where.name = filters.name

    const entities = await prisma.financialEntity.findMany({
      where,
    })
    return entities.map((e) => this.mapToDomain(e))
  }

  async delete(id: string): Promise<void> {
    const entity = await prisma.financialEntity.findUnique({ where: { id } })

    if (!entity) {
      throw new Error('Financial Entity not found')
    }

    // Renombramos al borrar para liberar el nombre (Unique Constraint)
    await prisma.financialEntity.update({
      where: { id },
      data: {
        name: `${entity.name}_deleted_${Date.now()}`,
        deletedAt: new Date(),
      },
    })
  }

  private mapToDomain(prismaEntity: any): FinancialEntity {
    return FinancialEntity.fromPrimitives({
      id: prismaEntity.id,
      name: prismaEntity.name,
      createdAt: prismaEntity.createdAt,
      updatedAt: prismaEntity.updatedAt,
    })
  }
}
