import {
  IFinancialProduct,
  FinancialProduct,
} from '@domain/models/financialProduct'
import { FinancialProductFactory } from '@domain/factories/financialProductFactory'
import { ValueHistory } from '@domain/models/valueHistory'

export interface PrismaProductUpdateInput extends Partial<IFinancialProduct> {
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

export class PrismaProductMapper {
  static toPrismaUpdate(product: PrismaProductUpdateInput): any {
    const data: any = {}

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

  static toPrismaCreate(product: IFinancialProduct): any {
    const p = product as any

    if (!product.id) throw new Error('Product ID is required')
    if (!product.clientId) throw new Error('Client ID is required')
    if (!product.financialEntity)
      throw new Error('Financial Entity is required')

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

  static toDomain(prismaProduct: any): FinancialProduct {
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

    // 2. Specific fields (Mergeamos todo lo que venga de prisma, la factoría filtrará lo que no corresponda al tipo)
    const specificFields = {
      ...prismaProduct,
    }

    return FinancialProductFactory.fromPrimitives({
      ...specificFields,
      ...base,
    } as IFinancialProduct)
  }
}
