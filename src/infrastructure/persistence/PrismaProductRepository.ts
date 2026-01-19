import { IFinancialProduct } from '../../domain/entities/IFinancialProduct';
import { IProductRepository } from '../../domain/IProductRepository';
import prisma from './prisma/client';
import { ProductType, ProductStatus, Prisma } from '@prisma/client';

export class PrismaProductRepository implements IProductRepository {
  
  async create(product: IFinancialProduct): Promise<IFinancialProduct> {
    const data = this.mapToPrisma(product);
    const createdProduct = await prisma.financialProduct.create({
      data: data
    });
    return this.mapToDomain(createdProduct);
  }

  async update(id: string, product: Partial<IFinancialProduct>): Promise<void> {

    const p = product as any;
    const data: any = {};

    // 1. Campos directos (1:1)
    const directFields = [
      'name', 'type', 'financialEntity', 'status',
      'currentBalance', 'monthlyInterestRate', 'initialCapital', 'annualInterestRate',
      'maturityDate', 'interestPaymentFreq', 'numberOfUnits', 'netAssetValue',
      'totalPurchaseValue', 'numberOfShares', 'unitPurchasePrice', 'currentMarketPrice'
    ];

    directFields.forEach(field => {
      if (p[field] !== undefined) {
        data[field] = p[field];
      }
    });

    // 2. Campos especiales (Relaciones y JSON)
    if (p.clientId !== undefined) data.client = { connect: { id: p.clientId } };
    if (p.fees !== undefined) data.fees = p.fees ?? Prisma.JsonNull;
    
    await prisma.financialProduct.update({
      where: { id },
      data: data
    });
  }

  async findById(id: string): Promise<IFinancialProduct | null> {
    const prismaProduct = await prisma.financialProduct.findUnique({
      where: { id },
      include: {
        valueHistory: true,
        transactions: true
      }
    });

    if (!prismaProduct) return null;

    return this.mapToDomain(prismaProduct);
  }

  async findAll(filters?: Partial<IFinancialProduct>): Promise<IFinancialProduct[]> {
    const where: Prisma.FinancialProductWhereInput = {};

    if (filters?.status) where.status = filters.status as ProductStatus;
    if (filters?.type) where.type = filters.type as ProductType;
    if (filters?.financialEntity) where.financialEntity = filters.financialEntity;

    const prismaProducts = await prisma.financialProduct.findMany({
      where,
      include: {
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

  private mapToPrisma(product: IFinancialProduct): Prisma.FinancialProductCreateInput {
    // Mapeo de la Entidad de Dominio -> Objeto de Base de Datos (Prisma)
    // Usamos 'as any' para acceder a propiedades que pueden ser específicas de subclases
    const p = product as any;

    if (!product.id) {
      throw new Error('Product ID is required');
    }

    return {
      id: product.id,
      name: product.name,
      type: product.type as ProductType,
      financialEntity: product.financialEntity,
      status: product.status as ProductStatus,
      // Conectamos con el cliente (asumiendo que clientId viene en la entidad)
      client: { connect: { id: product.clientId } },
      
      // Campos específicos (se guardan como NULL si no existen en el objeto)
      currentBalance: p.currentBalance ?? null,
      monthlyInterestRate: p.monthlyInterestRate ?? null,
      initialCapital: p.initialCapital ?? null,
      annualInterestRate: p.annualInterestRate ?? null,
      maturityDate: p.maturityDate ?? null,
      interestPaymentFreq: p.interestPaymentFreq ?? null,
      numberOfUnits: p.numberOfUnits ?? null,
      netAssetValue: p.netAssetValue ?? null,
      totalPurchaseValue: p.totalPurchaseValue ?? null,
      numberOfShares: p.numberOfShares ?? null,
      unitPurchasePrice: p.unitPurchasePrice ?? null,
      currentMarketPrice: p.currentMarketPrice ?? null,
      
      fees: p.fees ?? Prisma.JsonNull,
    };
  }

  private mapToDomain(prismaProduct: any): IFinancialProduct {
    // Mapeo de Objeto de Base de Datos (Prisma) -> Entidad de Dominio
    // Aquí reconstruimos el objeto. Si usas clases específicas (CurrentAccount, Stocks),
    // deberías instanciar la clase correcta según prismaProduct.type.
    
    const base = {
      id: prismaProduct.id,
      type: prismaProduct.type,
      name: prismaProduct.name,
      financialEntity: prismaProduct.financialEntity,
      status: prismaProduct.status,
      clientId: prismaProduct.clientId,
      createdAt: prismaProduct.createdAt,
      updatedAt: prismaProduct.updatedAt,
      valueHistory: prismaProduct.valueHistory || [],
      transactions: prismaProduct.transactions || [],
      fees: prismaProduct.fees
    };

    // Retornamos un objeto que cumple con la interfaz/clase FinancialProduct
    // combinando los datos base con los específicos que no sean nulos.
    return {
      ...base,
      currentBalance: prismaProduct.currentBalance,
      monthlyInterestRate: prismaProduct.monthlyInterestRate,
      initialCapital: prismaProduct.initialCapital,
      annualInterestRate: prismaProduct.annualInterestRate,
      maturityDate: prismaProduct.maturityDate,
      interestPaymentFreq: prismaProduct.interestPaymentFreq,
      numberOfUnits: prismaProduct.numberOfUnits,
      netAssetValue: prismaProduct.netAssetValue,
      totalPurchaseValue: prismaProduct.totalPurchaseValue,
      numberOfShares: prismaProduct.numberOfShares,
      unitPurchasePrice: prismaProduct.unitPurchasePrice,
      currentMarketPrice: prismaProduct.currentMarketPrice,
    } as unknown as IFinancialProduct;
  }
}
