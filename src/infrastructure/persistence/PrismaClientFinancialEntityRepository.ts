import { IClientFinancialEntity } from '@domain/entities/IClientFinancialEntity';
import { IClientFinancialEntityRepository } from '@domain/IClientFinancialEntityRepository';
import { CreateClientFinancialEntityDto } from '@application/dtos/clientFinancialEntityDto';
import prisma from '@infrastructure/persistence/prisma/client';
import { Prisma } from '@prisma/client';

export class PrismaClientFinancialEntityRepository implements IClientFinancialEntityRepository {
  
  async create(dto: CreateClientFinancialEntityDto): Promise<IClientFinancialEntity> {
    const created = await prisma.clientFinancialEntity.create({
      data: {
        clientId: dto.clientId,
        financialEntityId: dto.financialEntityId,
        balance: (dto.balance !== null && dto.balance !== undefined) ? new Prisma.Decimal(dto.balance) : null,
        initialBalance: (dto.initialBalance !== null && dto.initialBalance !== undefined) ? new Prisma.Decimal(dto.initialBalance) : ((dto.balance !== null && dto.balance !== undefined) ? new Prisma.Decimal(dto.balance) : null),
        // Crear histórico inicial si hay balance
        valueHistory: (dto.balance !== null && dto.balance !== undefined) ? {
          create: {
            date: new Date(),
            value: new Prisma.Decimal(dto.balance),
            previousValue: null
          }
        } : undefined
      },
      include: { financialEntity: true }
    });

    return this.mapToDomain(created);
  }

  async update(id: string, entity: Partial<IClientFinancialEntity>): Promise<void> {
    const data: Prisma.ClientFinancialEntityUpdateInput = {};
    
    if (entity.balance !== undefined) {
      // Obtener el valor anterior para el histórico
      const currentEntity = await prisma.clientFinancialEntity.findUnique({ where: { id } });
      const previousValue = currentEntity?.balance;

      data.balance = (entity.balance !== null) ? new Prisma.Decimal(entity.balance) : null;
      if (entity.balance !== null && entity.balance !== undefined) {
        data.valueHistory = {
          create: {
            date: new Date(),
            value: new Prisma.Decimal(entity.balance),
            previousValue: previousValue
          }
        };
      }
    }
    
    await prisma.clientFinancialEntity.update({
      where: { id },
      data
    });
  }

  async findById(id: string): Promise<IClientFinancialEntity | null> {
    const entity = await prisma.clientFinancialEntity.findUnique({ 
      where: { id },
      include: { valueHistory: true, financialEntity: true }
    });
    if (!entity) return null;
    return this.mapToDomain(entity);
  }

  async findAll(filters?: Partial<IClientFinancialEntity> & { name?: string }): Promise<IClientFinancialEntity[]> {
    const where: Prisma.ClientFinancialEntityWhereInput = {};
    if (filters?.clientId) where.clientId = filters.clientId;
    if (filters?.financialEntityId) where.financialEntityId = filters.financialEntityId;
    if (filters?.name) where.financialEntity = { name: filters.name };

    const entities = await prisma.clientFinancialEntity.findMany({ 
      where,
      include: { financialEntity: true }
    });
    return entities.map(e => this.mapToDomain(e));
  }

  async delete(id: string): Promise<void> {
    await prisma.clientFinancialEntity.delete({ where: { id } });
  }

  private mapToDomain(prismaEntity: any): IClientFinancialEntity {
    return {
      id: prismaEntity.id,
      balance: prismaEntity.balance ? Number(prismaEntity.balance) : 0,
      initialBalance: prismaEntity.initialBalance ? Number(prismaEntity.initialBalance) : undefined,
      clientId: prismaEntity.clientId,
      financialEntityId: prismaEntity.financialEntityId,
      financialEntity: prismaEntity.financialEntity ? {
        id: prismaEntity.financialEntity.id,
        name: prismaEntity.financialEntity.name,
        createdAt: prismaEntity.financialEntity.createdAt,
        updatedAt: prismaEntity.financialEntity.updatedAt
      } : undefined,
      createdAt: prismaEntity.createdAt,
      updatedAt: prismaEntity.updatedAt,
      valueHistory: prismaEntity.valueHistory?.map((h: any) => ({
        id: h.id,
        date: h.date,
        value: Number(h.value),
        previousValue: h.previousValue ? Number(h.previousValue) : undefined,
        clientFinancialEntityId: h.clientFinancialEntityId
      })) || []
    };
  }
}
