import { IClientFinancialEntity } from '@domain/entities/IClientFinancialEntity';
import { IClientFinancialEntityRepository } from '@domain/IClientFinancialEntityRepository';
import { CreateClientFinancialEntityDto } from '@application/dtos/clientFinancialEntityDto';
import prisma from '@infrastructure/persistence/prisma/client';
import { Prisma } from '@prisma/client';

export class PrismaClientFinancialEntityRepository implements IClientFinancialEntityRepository {
  
  async create(dto: CreateClientFinancialEntityDto): Promise<IClientFinancialEntity> {
    try {
      // Construimos el objeto data dinámicamente para evitar pasar 'undefined' en relaciones
      const data: any = {
        clientId: dto.clientId,
        financialEntityId: dto.financialEntityId,
        balance: (dto.balance !== null && dto.balance !== undefined) ? new Prisma.Decimal(dto.balance) : null,
        initialBalance: (dto.initialBalance !== null && dto.initialBalance !== undefined) ? new Prisma.Decimal(dto.initialBalance) : ((dto.balance !== null && dto.balance !== undefined) ? new Prisma.Decimal(dto.balance) : null),
      };

      if (dto.balance !== null && dto.balance !== undefined) {
        data.valueHistory = {
          create: {
            date: new Date(),
            value: new Prisma.Decimal(dto.balance),
          }
        };
      }

      const created = await prisma.clientFinancialEntity.create({
        data: data,
        include: { 
          financialEntity: true,        
          valueHistory: true
        }
      });

      return this.mapToDomain(created);
    } catch (error: any) {
      // Si ya existe (activo o borrado), lo reactivamos y actualizamos
      if (error.code === 'P2002') {

        // 1. Verificar si existe y está ACTIVO
        // Usamos findFirst para evitar problemas con la extensión soft-delete y claves compuestas
        const existingActive = await prisma.clientFinancialEntity.findFirst({
          where: {
            clientId: dto.clientId,
            financialEntityId: dto.financialEntityId
          }
        });



        if (existingActive) throw error; // Está activo -> Dejar que falle con 409

        // 2. Si llegamos aquí, existe pero está borrado -> RESTAURAR
        const updateData: Prisma.ClientFinancialEntityUpdateInput = {
          deletedAt: null
        };

        if (dto.balance !== null && dto.balance !== undefined) {
          updateData.balance = new Prisma.Decimal(dto.balance);
          updateData.valueHistory = {
            create: {
              date: new Date(),
              value: new Prisma.Decimal(dto.balance)
            }
          };
        }


        const updated = await prisma.clientFinancialEntity.update({
          where: {
            clientId_financialEntityId: {
              clientId: dto.clientId,
              financialEntityId: dto.financialEntityId
            }
          },
          data: updateData,
          include: { 
            financialEntity: true,        
            valueHistory: true
          }
        });


        return this.mapToDomain(updated);
      }
      throw error;
    }
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
    const entity = await prisma.clientFinancialEntity.findFirst({ 
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
