import {
  IFinancialProduct,
  FinancialProduct,
} from '@domain/models/financialProduct'
import { IProductRepository } from '@domain/repository/IProductRepository'
import prisma from '@infrastructure/persistence/prisma/repository/prismaClient'
import { FinancialProductFactory } from '@domain/factories/financialProductFactory'
import { ValueHistory } from '@domain/models/valueHistory'

// Definimos una interfaz extendida para manejar los campos específicos de todos los subtipos
// dentro del repositorio, ya que Partial<IFinancialProduct> solo ve los campos base.
interface ExtendedProductInput extends Partial<IFinancialProduct> {
  currentBalance?: number
  monthlyInterestRate?: number
  annualInterestRate?: number
  initialDate?: Date | string
  maturityDate?: Date | string
  numberOfUnits?: number
  netAssetValue?: number
  numberOfShares?: number
  unitPurchasePrice?: number
  currentMarketPrice?: number
  interestPaymentFreq?: string
}

export class PrismaProductRepository implements IProductRepository {
  async create(product: FinancialProduct): Promise<FinancialProduct> {
    const data = this.mapToPrisma(product)
    try {
      const createdProduct = await prisma.financialProduct.create({
        data: data,
        include: {
          financialEntity: true,
          valueHistory: true,
          transactions: true,
          client: true,
        },
      })
      return this.mapToDomain(createdProduct)
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error(
          `Financial Entity with ID '${product.financialEntity}' not found`
        )
      }
      throw error
    }
  }

  async update(id: string, product: Partial<IFinancialProduct>): Promise<void> {
    const p = product as ExtendedProductInput
    const data = this.mapToPrismaUpdate(p)

    // 2. Lógica de Historial (Business Rule en Infra - Deuda técnica aceptada por ahora)
    // Idealmente esto debería venir resuelto desde el Dominio, no calculado aquí.
    const newValue = p.currentBalance
    if (newValue !== undefined && newValue !== null) {
      const currentProduct = await prisma.financialProduct.findUnique({
        where: { id },
        select: { currentBalance: true },
      })
      const previousValue = currentProduct?.currentBalance
        ? Number(currentProduct.currentBalance)
        : null

      if (previousValue !== newValue) {
        data.valueHistory = {
          create: {
            date: new Date(),
            value: newValue,
            previousValue: previousValue ?? null,
          },
        }
      }
    }

    try {
      await prisma.financialProduct.update({
        where: { id },
        data: data,
      })
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error(
          `Financial Entity with ID '${product.financialEntity}' not found`
        )
      }
      throw error
    }
  }

  async findById(id: string): Promise<FinancialProduct | null> {
    const prismaProduct = await prisma.financialProduct.findFirst({
      where: { id },
      include: {
        financialEntity: true,
        valueHistory: true,
        transactions: true,
        client: true,
      },
    })

    if (!prismaProduct) return null

    return this.mapToDomain(prismaProduct)
  }

  async findAll(
    filters?: Partial<IFinancialProduct>
  ): Promise<FinancialProduct[]> {
    const where: any = {}

    if (filters?.clientId) where.clientId = filters.clientId
    if (filters?.status) where.status = filters.status as any
    if (filters?.type) where.type = filters.type as any
    if (filters?.financialEntity)
      where.financialEntity = { name: filters.financialEntity }

    const prismaProducts = await prisma.financialProduct.findMany({
      where,
      include: {
        financialEntity: true,
        valueHistory: true,
        transactions: true,
        client: true,
      },
    })

    return prismaProducts.map((p: any) => this.mapToDomain(p))
  }

  async delete(id: string): Promise<void> {
    await prisma.financialProduct.delete({
      where: { id },
    })
  }

  // --- Mappers ---

  private mapToPrismaUpdate(product: ExtendedProductInput): any {
    const data: any = {}

    // Mapeo explícito campo a campo.
    // Si añades un campo al dominio, TypeScript no se quejará aquí (porque es Partial)
    if (product.name !== undefined) data.name = product.name
    if (product.type !== undefined) data.type = product.type
    if (product.status !== undefined) data.status = product.status
    if (product.currentBalance !== undefined)
      data.currentBalance = product.currentBalance
    if (product.monthlyInterestRate !== undefined)
      data.monthlyInterestRate = product.monthlyInterestRate
    if (product.annualInterestRate !== undefined)
      data.annualInterestRate = product.annualInterestRate
    if (product.initialDate !== undefined) {
      data.initialDate =
        typeof product.initialDate === 'string'
          ? new Date(product.initialDate)
          : product.initialDate
    }
    if (product.maturityDate !== undefined) {
      data.maturityDate =
        typeof product.maturityDate === 'string'
          ? new Date(product.maturityDate)
          : product.maturityDate
    }
    if (product.numberOfUnits !== undefined)
      data.numberOfUnits = product.numberOfUnits
    if (product.netAssetValue !== undefined)
      data.netAssetValue = product.netAssetValue
    if (product.numberOfShares !== undefined)
      data.numberOfShares = product.numberOfShares
    if (product.unitPurchasePrice !== undefined)
      data.unitPurchasePrice = product.unitPurchasePrice
    if (product.currentMarketPrice !== undefined)
      data.currentMarketPrice = product.currentMarketPrice
    if (product.interestPaymentFreq !== undefined)
      data.interestPaymentFreq = product.interestPaymentFreq

    if (product.clientId !== undefined) {
      data.client = { connect: { id: product.clientId } }
    }
    if (product.financialEntity !== undefined) {
      data.financialEntity = { connect: { id: product.financialEntity } }
    }
    return data
  }

  private mapToPrisma(product: IFinancialProduct): any {
    // Entity Domain -> Object (Prisma)
    const p = product as any

    if (!product.id) {
      throw new Error('Product ID is required')
    }
    if (!product.clientId) {
      throw new Error('Client ID is required')
    }
    if (!product.financialEntity) {
      throw new Error('Financial Entity is required')
    }

    return {
      id: product.id,
      name: product.name,
      type: product.type as any,
      financialEntity: {
        connect: { id: product.financialEntity },
      },
      status: product.status as any,
      client: { connect: { id: product.clientId } },

      currentBalance: p.currentBalance ?? null,
      monthlyInterestRate: p.monthlyInterestRate ?? null,
      initialBalance: p.initialBalance ?? null,
      initialDate: p.initialDate ? new Date(p.initialDate) : null,
      annualInterestRate: p.annualInterestRate ?? null,
      maturityDate: p.maturityDate ? new Date(p.maturityDate) : null,
      interestPaymentFreq: p.interestPaymentFreq ?? null,
      numberOfUnits: p.numberOfUnits ?? null,
      netAssetValue: p.netAssetValue ?? null,
      numberOfShares: p.numberOfShares ?? null,
      unitPurchasePrice: p.unitPurchasePrice ?? null,
      currentMarketPrice: p.currentMarketPrice ?? null,
    }
  }

  private mapToDomain(prismaProduct: any): FinancialProduct {
    // Mapped  Object DB (Prisma) -> Entity Domain

    // 1. Fields
    const base: any = {
      id: prismaProduct.id,
      type: prismaProduct.type,
      name: prismaProduct.name,
      financialEntity: prismaProduct.financialEntityId,
      financialEntityName: prismaProduct.financialEntity?.name,
      status: prismaProduct.status,
      clientId: prismaProduct.clientId,
      client: prismaProduct.client
        ? {
            firstName: prismaProduct.client.firstName,
            lastName: prismaProduct.client.lastName,
            email: prismaProduct.client.email,
          }
        : undefined,
      createdAt: prismaProduct.createdAt,
      updatedAt: prismaProduct.updatedAt,
      valueHistory:
        prismaProduct.valueHistory?.map((h: any) =>
          ValueHistory.fromPrimitives({
            id: h.id,
            date: h.date,
            value: Number(h.value),
            previousValue: h.previousValue
              ? Number(h.previousValue)
              : undefined,
            productId: h.productId,
          })
        ) || [],
    }

    // 2. Specific fields
    let specificFields = {}

    switch (prismaProduct.type) {
      case 'CURRENT_ACCOUNT':
        specificFields = {
          currentBalance: prismaProduct.currentBalance,
          transactions: prismaProduct.transactions || [],
        }
        break
      case 'SAVINGS_ACCOUNT':
        specificFields = {
          currentBalance: prismaProduct.currentBalance,
          monthlyInterestRate: prismaProduct.monthlyInterestRate,
          transactions: prismaProduct.transactions || [],
        }
        break
      case 'FIXED_TERM_DEPOSIT':
        specificFields = {
          initialBalance: prismaProduct.initialBalance,
          currentBalance: prismaProduct.currentBalance,
          initialDate: prismaProduct.initialDate,
          maturityDate: prismaProduct.maturityDate,
          annualInterestRate: prismaProduct.annualInterestRate,
          interestPaymentFreq: prismaProduct.interestPaymentFreq,
        }
        break
      case 'INVESTMENT_FUND':
        specificFields = {
          initialBalance: prismaProduct.initialBalance,
          currentBalance: prismaProduct.currentBalance,
          numberOfUnits: prismaProduct.numberOfUnits,
          netAssetValue: prismaProduct.netAssetValue,
        }
        break
      case 'STOCKS':
        specificFields = {
          numberOfShares: prismaProduct.numberOfShares,
          unitPurchasePrice: prismaProduct.unitPurchasePrice,
          currentMarketPrice: prismaProduct.currentMarketPrice,
          currentBalance: prismaProduct.currentBalance,
          initialBalance: prismaProduct.initialBalance,
        }
        break
    }

    return FinancialProductFactory.fromPrimitives({
      ...base,
      ...specificFields,
    } as IFinancialProduct)
  }
}
