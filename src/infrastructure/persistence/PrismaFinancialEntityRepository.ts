import { IFinancialEntity } from '@domain/entities/IFinancialEntity';
import { IFinancialEntityRepository } from '@domain/IFinancialEntityRepository';
import prisma from '@infrastructure/persistence/prisma/client';
import { Prisma } from '@prisma/client';

export class PrismaFinancialEntityRepository implements IFinancialEntityRepository {
  
  async create(entity: IFinancialEntity): Promise<IFinancialEntity> {
    if (!entity.clientId) throw new Error("Client ID is required");
    
    const data: Prisma.FinancialEntityCreateInput = {
      id: entity.id,
      name: entity.name,
      balance: (entity.balance !== null && entity.balance !== undefined) ? new Prisma.Decimal(entity.balance) : null,
      client: { connect: { id: entity.clientId } }
    };

    const created = await prisma.financialEntity.create({ data });
    return this.mapToDomain(created);
  }

  async update(id: string, entity: Partial<IFinancialEntity>): Promise<void> {
    const data: Prisma.FinancialEntityUpdateInput = {};
    
    if (entity.name !== undefined) data.name = entity.name;
    if (entity.balance !== undefined) {
      data.balance = (entity.balance !== null) ? new Prisma.Decimal(entity.balance) : null;
      if (entity.balance !== null && entity.balance !== undefined) {
        data.valueHistory = {
          create: {
            date: new Date(),
            value: new Prisma.Decimal(entity.balance)
          }
        };
      }
    }
    
    await prisma.financialEntity.update({
      where: { id },
      data
    });
  }

  async findById(id: string): Promise<IFinancialEntity | null> {
    const entity = await prisma.financialEntity.findUnique({ 
      where: { id },
      include: { valueHistory: true }
    });
    if (!entity) return null;
    return this.mapToDomain(entity);
  }

  async findAll(filters?: Partial<IFinancialEntity>): Promise<IFinancialEntity[]> {
    const where: Prisma.FinancialEntityWhereInput = {};
    if (filters?.clientId) where.clientId = filters.clientId;
    if (filters?.name) where.name = filters.name;

    const entities = await prisma.financialEntity.findMany({ where });
    return entities.map(e => this.mapToDomain(e));
  }

  async delete(id: string): Promise<void> {
    await prisma.financialEntity.delete({ where: { id } });
  }

  private mapToDomain(prismaEntity: any): IFinancialEntity {
    return {
      id: prismaEntity.id,
      name: prismaEntity.name,
      balance: prismaEntity.balance ? Number(prismaEntity.balance) : null,
      clientId: prismaEntity.clientId,
      createdAt: prismaEntity.createdAt,
      updatedAt: prismaEntity.updatedAt,
      valueHistory: prismaEntity.valueHistory?.map((h: any) => ({
        id: h.id,
        date: h.date,
        value: Number(h.value),
        financialEntityId: h.financialEntityId
      })) || []
    };
  }
}