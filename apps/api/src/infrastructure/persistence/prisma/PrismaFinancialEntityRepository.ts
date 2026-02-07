import { IFinancialEntity } from '@domain/entities/IFinancialEntity'
import { IFinancialEntityRepository } from '@domain/repository/IFinancialEntityRepository'
import { CreateFinancialEntityDto } from '@application/dtos/financialEntityDto'
import prisma from '@infrastructure/persistence/prisma/client'
import { Prisma } from '@prisma/client'

export class PrismaFinancialEntityRepository implements IFinancialEntityRepository {
  async create(dto: CreateFinancialEntityDto): Promise<IFinancialEntity> {
    const created = await prisma.financialEntity.create({
      data: {
        name: dto.name,
      },
    })

    return this.mapToDomain(created)
  }

  async update(id: string, entity: Partial<IFinancialEntity>): Promise<void> {
    const data: Prisma.FinancialEntityUpdateInput = {}

    if (entity.name !== undefined) data.name = entity.name

    await prisma.financialEntity.update({
      where: { id },
      data,
    })
  }

  async findById(id: string): Promise<IFinancialEntity | null> {
    const entity = await prisma.financialEntity.findUnique({
      where: { id },
    })
    if (!entity) return null
    return this.mapToDomain(entity)
  }

  async findAll(
    filters?: Partial<IFinancialEntity> & { name?: string }
  ): Promise<IFinancialEntity[]> {
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

  private mapToDomain(prismaEntity: any): IFinancialEntity {
    return {
      id: prismaEntity.id,
      name: prismaEntity.name,
      createdAt: prismaEntity.createdAt,
      updatedAt: prismaEntity.updatedAt,
    }
  }
}
