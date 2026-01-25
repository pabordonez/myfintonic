import { randomUUID } from 'crypto'
import { z } from 'zod'
import { IFinancialProduct } from '@domain/entities/IFinancialProduct'
import { ProductType } from '@domain/types'

export interface IProductFactory {
  create(data: Omit<IFinancialProduct, 'id'>): IFinancialProduct
}

const currentAccountSchema = z.object({
  currentBalance: z.number({ required_error: 'Missing required field: currentBalance' }),
})

const savingsAccountSchema = z.object({
  currentBalance: z.number({ required_error: 'Missing required field: currentBalance' }),
  monthlyInterestRate: z.number({ required_error: 'Missing required field: monthlyInterestRate' }),
})

const fixedTermDepositSchema = z.object({
  initialCapital: z.number({ required_error: 'Missing required field: initialCapital' }),
  maturityDate: z.coerce.date({ required_error: 'Missing required field: maturityDate' }),
  annualInterestRate: z.number({ required_error: 'Missing required field: annualInterestRate' }),
  interestPaymentFrequency: z.enum(['Monthly', 'Quarterly', 'Annual', 'AtMaturity'], {
    required_error: 'Missing required field: interestPaymentFrequency',
  }),
})

const investmentFundSchema = z.object({
  numberOfUnits: z.number({ required_error: 'Missing required field: numberOfUnits' }),
  netAssetValue: z.number({ required_error: 'Missing required field: netAssetValue' }),
  totalPurchaseValue: z.number({ required_error: 'Missing required field: totalPurchaseValue' }),
  fees: z.object(
    {
      opening: z.number(),
      closing: z.number(),
      maintenance: z.number(),
    },
    { required_error: 'Missing required field: fees' }
  ),
})

const stocksSchema = z.object({
  numberOfShares: z.number({ required_error: 'Missing required field: numberOfShares' }),
  unitPurchasePrice: z.number({ required_error: 'Missing required field: unitPurchasePrice' }),
  currentMarketPrice: z.number({ required_error: 'Missing required field: currentMarketPrice' }),
  fees: z.object(
    {
      buying: z.number(),
      selling: z.number(),
    },
    { required_error: 'Missing required field: fees' }
  ),
})

const productSchemas: Record<ProductType, z.ZodType<any>> = {
  CURRENT_ACCOUNT: currentAccountSchema,
  SAVINGS_ACCOUNT: savingsAccountSchema,
  FIXED_TERM_DEPOSIT: fixedTermDepositSchema,
  INVESTMENT_FUND: investmentFundSchema,
  STOCKS: stocksSchema,
}

export class ProductFactory implements IProductFactory {
  create<IFinancialProductCreate extends IFinancialProduct>(
    data: Omit<IFinancialProductCreate, 'id'>
  ): IFinancialProductCreate {
    this.validate(data)

    const prefix = this.getPrefix(data.type)
    const id = `${prefix}-${randomUUID()}`
    const now = new Date()

    return {
      ...data,
      id,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
      valueHistory: data.valueHistory || [],
    } as unknown as IFinancialProductCreate
  }

  private validate<IFinancialProductValidate extends IFinancialProduct>(
    data: Omit<IFinancialProductValidate, 'id'>
  ): void {
    const schema = productSchemas[data.type]

    if (schema) {
      const result = schema.safeParse(data)
      if (!result.success) {
        const errorMessages = result.error.errors.map(e => e.message).join(', ')
        throw new Error(`Validation failed: ${errorMessages}`)
      }
    }
  }

  private getPrefix(type: ProductType): string {
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
