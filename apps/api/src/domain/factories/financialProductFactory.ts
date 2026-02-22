import {
  IFinancialProduct,
  FinancialProduct,
} from '@domain/models/financialProduct'
import { ProductType } from '@domain/types'
import { CurrentAccount } from '@domain/factories/financialProduct/currentAccount'
import { SavingsAccount } from '@domain/factories/financialProduct/savingsAccount'
import { FixedTermDeposit } from '@domain/factories/financialProduct/fixedTermDeposit'
import { InvestmentFund } from '@domain/factories/financialProduct/investmentFund'
import { Stocks } from '@domain/factories/financialProduct/stocks'

export class FinancialProductFactory {
  public static create(
    data: Omit<IFinancialProduct, 'id' | 'createdAt' | 'updatedAt'> & {
      createdAt?: Date
      updatedAt?: Date
      [key: string]: any
    },
    uuid: string
  ): FinancialProduct {
    if (!data.name || !data.type || !data.financialEntity || !data.status) {
      throw new Error('Missing required fields')
    }

    const prefix = FinancialProductFactory.getPrefix(data.type)
    const id = `${prefix}-${uuid}`
    const now = new Date()

    const fullData = {
      ...data,
      id,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
      valueHistory: data.valueHistory || [],
    }

    return FinancialProductFactory.fromPrimitives(fullData as IFinancialProduct)
  }

  public static fromPrimitives(data: IFinancialProduct): FinancialProduct {
    switch (data.type) {
      case 'CURRENT_ACCOUNT':
        return CurrentAccount.create(data)
      case 'SAVINGS_ACCOUNT':
        return SavingsAccount.create(data)
      case 'FIXED_TERM_DEPOSIT':
        return FixedTermDeposit.create(data)
      case 'INVESTMENT_FUND':
        return InvestmentFund.create(data)
      case 'STOCKS':
        return Stocks.create(data)
      default:
        throw new Error(`Unknown product type: ${data.type}`)
    }
  }

  private static getPrefix(type: ProductType): string {
    const prefixes: Record<ProductType, string> = {
      CURRENT_ACCOUNT: 'CUR',
      SAVINGS_ACCOUNT: 'SAV',
      FIXED_TERM_DEPOSIT: 'FIX',
      INVESTMENT_FUND: 'INV',
      STOCKS: 'STK',
    }
    return prefixes[type] || 'GEN'
  }
}
