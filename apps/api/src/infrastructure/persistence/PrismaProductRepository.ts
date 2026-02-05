import { IFinancialProduct } from '@domain/entities/IFinancialProduct';
import { IProductRepository } from '@domain/IProductRepository';
import prisma from '@infrastructure/persistence/prisma/client';

export class PrismaProductRepository implements IProductRepository {
  
  async create(product: IFinancialProduct): Promise<IFinancialProduct> {
    const data = this.mapToPrisma(product);
    try {
      const createdProduct = await prisma.financialProduct.create({
        data: data,
        include: {
          financialEntity: true,
          valueHistory: true,
          transactions: true
        }
      });
      return this.mapToDomain(createdProduct);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error(`Financial Entity with ID '${product.financialEntity}' not found`);
      }
      throw error;
    }
  }

  async update(id: string, product: Partial<IFinancialProduct>): Promise<void> {
    const p = product as any;
    const data: any = {};

    // 1. Campos directos (1:1)
    const directFields = [
      'name', 'type', 'status',
      'currentBalance', 'monthlyInterestRate', 'initialBalance', 'initialDate', 'annualInterestRate',
      'maturityDate', 'numberOfUnits', 'netAssetValue',
      'numberOfShares', 'unitPurchasePrice', 'currentMarketPrice'
    ];

    directFields.forEach(field => {
      if (p[field] !== undefined) {
        if ((field === 'initialDate' || field === 'maturityDate') && typeof p[field] === 'string') {
          const date = new Date(p[field]);
          if (!isNaN(date.getTime())) data[field] = date;
        } else {
          data[field] = p[field];
        }
      }
    });

    // Mapeo manual para campos con nombres diferentes (Dominio vs BD)
    if (p.interestPaymentFrequency !== undefined) {
      data.interestPaymentFreq = p.interestPaymentFrequency;
    }

    // 2. Campos especiales (Relaciones y JSON)
    if (p.clientId !== undefined) data.client = { connect: { id: p.clientId } };
    if (p.fees !== undefined) data.fees = p.fees ?? null;
    
    // Generar histórico si cambia el saldo (Cuentas, Fondos)
    const newValue = p.currentBalance;
    if (newValue !== undefined && newValue !== null) {
      // Obtener valor anterior para el histórico
      const currentProduct = await prisma.financialProduct.findUnique({ where: { id } });
      const previousValue = currentProduct?.currentBalance;

      data.valueHistory = {
        create: {
          date: new Date(),
          value: newValue,
          previousValue: previousValue ?? null
        }
      };
    }

    // Manejo de la relación con FinancialEntity en update
    if (p.financialEntity !== undefined) {
      data.financialEntity = {
        connect: { id: p.financialEntity }
      };
    }
    
    try {
      await prisma.financialProduct.update({
        where: { id },
        data: data
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error(`Financial Entity with ID '${p.financialEntity}' not found`);
      }
      throw error;
    }
  }

  async findById(id: string): Promise<IFinancialProduct | null> {
    const prismaProduct = await prisma.financialProduct.findFirst({
      where: { id },
      include: {
        financialEntity: true,
        valueHistory: true,
        transactions: true
      }
    });

    if (!prismaProduct) return null;

    return this.mapToDomain(prismaProduct);
  }

  async findAll(filters?: Partial<IFinancialProduct>): Promise<IFinancialProduct[]> {
    const where: any = {};

    if (filters?.clientId) where.clientId = filters.clientId;
    if (filters?.status) where.status = filters.status as any;
    if (filters?.type) where.type = filters.type as any;
    if (filters?.financialEntity) where.financialEntity = { name: filters.financialEntity };

    const prismaProducts = await prisma.financialProduct.findMany({
      where,
      include: {
        financialEntity: true,
        valueHistory: true,
        transactions: true
      }
    });

    return prismaProducts.map((p: any) => this.mapToDomain(p));
  }

  async delete(id: string): Promise<void> {
    await prisma.financialProduct.delete({
      where: { id }
    });
  }

  // --- Mappers Privados ---

  private mapToPrisma(product: IFinancialProduct): any {
    // Mapeo de la Entidad de Dominio -> Objeto de Base de Datos (Prisma)
    // Usamos 'as any' para acceder a propiedades que pueden ser específicas de subclases
    const p = product as any;

    if (!product.id) {
      throw new Error('Product ID is required');
    }
    if (!product.clientId) {
      throw new Error('Client ID is required');
    }
    if (!product.financialEntity) {
      throw new Error('Financial Entity is required');
    }

    return {
      id: product.id,
      name: product.name,
      type: product.type as any,
      // Conectamos la entidad financiera basada en el ID
      financialEntity: {
        connect: { id: product.financialEntity }
      },
      status: product.status as any,
      client: { connect: { id: product.clientId } },
      
      currentBalance: p.currentBalance ?? null,
      monthlyInterestRate: p.monthlyInterestRate ?? null,
      initialBalance: p.initialBalance ?? null,
      initialDate: p.initialDate ?? null,
      annualInterestRate: p.annualInterestRate ?? null,
      maturityDate: p.maturityDate ?? null,
      interestPaymentFreq: p.interestPaymentFrequency ?? null,
      numberOfUnits: p.numberOfUnits ?? null,
      netAssetValue: p.netAssetValue ?? null,
      numberOfShares: p.numberOfShares ?? null,
      unitPurchasePrice: p.unitPurchasePrice ?? null,
      currentMarketPrice: p.currentMarketPrice ?? null,
      
      fees: p.fees ?? null,
    };
  }

  private mapToDomain(prismaProduct: any): IFinancialProduct {
    // Mapeo de Objeto de Base de Datos (Prisma) -> Entidad de Dominio
    // Aquí reconstruimos el objeto. Si usas clases específicas (CurrentAccount, Stocks),
    // deberías instanciar la clase correcta según prismaProduct.type.

    // 1. Campos Comunes
    const base: any = {
      id: prismaProduct.id,
      type: prismaProduct.type,
      name: prismaProduct.name,
      financialEntity: prismaProduct.financialEntityId, 
      financialEntityName: prismaProduct.financialEntity?.name,
      status: prismaProduct.status,
      clientId: prismaProduct.clientId,
      createdAt: prismaProduct.createdAt,
      updatedAt: prismaProduct.updatedAt,
      valueHistory: prismaProduct.valueHistory?.map((h: any) => ({
        id: h.id,
        date: h.date,
        value: Number(h.value),
        previousValue: h.previousValue ? Number(h.previousValue) : undefined
      })) || [],
    };

    // 2. Campos Específicos según el tipo
    let specificFields = {};

    switch (prismaProduct.type) {
      case 'CURRENT_ACCOUNT':
        specificFields = {
          currentBalance: prismaProduct.currentBalance,
          transactions: prismaProduct.transactions || []
        };
        break;
      case 'SAVINGS_ACCOUNT':
        specificFields = {
          currentBalance: prismaProduct.currentBalance,
          monthlyInterestRate: prismaProduct.monthlyInterestRate
        };
        break;
      case 'FIXED_TERM_DEPOSIT':
        specificFields = {
          initialBalance: prismaProduct.initialBalance,
          currentBalance: prismaProduct.currentBalance,
          initialDate: prismaProduct.initialDate,
          maturityDate: prismaProduct.maturityDate,
          annualInterestRate: prismaProduct.annualInterestRate,
          interestPaymentFrequency: prismaProduct.interestPaymentFreq
        };
        break;
      case 'INVESTMENT_FUND':
        specificFields = {
          initialBalance: prismaProduct.initialBalance,
          currentBalance: prismaProduct.currentBalance,
          numberOfUnits: prismaProduct.numberOfUnits,
          netAssetValue: prismaProduct.netAssetValue,
          fees: prismaProduct.fees
        };
        break;
      case 'STOCKS':
        specificFields = {
          numberOfShares: prismaProduct.numberOfShares,
          unitPurchasePrice: prismaProduct.unitPurchasePrice,
          currentMarketPrice: prismaProduct.currentMarketPrice,
          currentBalance: prismaProduct.currentBalance,
          initialBalance: prismaProduct.initialBalance,
          fees: prismaProduct.fees
        };
        break;
    }

    return { ...base, ...specificFields } as IFinancialProduct;
  }
}
