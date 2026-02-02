import { randomUUID } from 'crypto'
import { z } from 'zod'
import { IFinancialProduct } from '@domain/entities/IFinancialProduct'
import { ProductType } from '@domain/types'

export interface IProductFactory {
  create(data: Omit<IFinancialProduct, 'id'>): IFinancialProduct
  validateUpdate(type: ProductType, data: any): void
}

const currentAccountSchema = z.object({
  currentBalance: z.number({ required_error: 'Missing required field: currentBalance' }),
})

const savingsAccountSchema = z.object({
  currentBalance: z.number({ required_error: 'Missing required field: currentBalance' }),
  monthlyInterestRate: z.number({ required_error: 'Missing required field: monthlyInterestRate' }),
})

const fixedTermDepositSchema = z.object({
  initialBalance: z.number({ required_error: 'Missing required field: initialBalance' }),
  initialDate: z.coerce.date({ required_error: 'Missing required field: initialDate' }),
  maturityDate: z.coerce.date({ required_error: 'Missing required field: maturityDate' }),
  annualInterestRate: z.number({ required_error: 'Missing required field: annualInterestRate' }),
  interestPaymentFrequency: z.enum(['Monthly', 'Quarterly', 'Annual', 'AtMaturity'], {
    required_error: 'Missing required field: interestPaymentFrequency',
  }),
})

const investmentFundSchema = z.object({
  numberOfUnits: z.number().optional(),
  netAssetValue: z.number().optional(),
  currentBalance: z.number({ required_error: 'Missing required field: currentBalance' }),
  fees: z.object(
    {
      opening: z.number(),
      closing: z.number(),
      maintenance: z.number(),
    },
    { required_error: 'Missing required field: fees' }
  ).optional(),
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
  ).optional(),
})

const productSchemas: Record<ProductType, z.ZodObject<any, any>> = {
  CURRENT_ACCOUNT: currentAccountSchema,
  SAVINGS_ACCOUNT: savingsAccountSchema,
  FIXED_TERM_DEPOSIT: fixedTermDepositSchema,
  INVESTMENT_FUND: investmentFundSchema,
  STOCKS: stocksSchema,
}

// Schema for fields that are common to all products and can be updated
const commonUpdateSchema = z.object({
  name: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PAUSED', 'EXPIRED']).optional(),
  financialEntity: z.string().optional(),
  clientId: z.string().optional(),
})

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

  validateUpdate(type: ProductType, data: any): void {
    const specificSchema = productSchemas[type]
    
    // Create a schema that allows common fields + specific fields (all optional for update)
    // .strict() ensures no other fields are allowed
    const updateSchema = commonUpdateSchema
      .merge(specificSchema ? specificSchema.partial() : z.object({}))
      .strict()

    const result = updateSchema.safeParse(data)

    if (!result.success) {
      const errorMessages = result.error.errors.map(e => {
        if (e.code === 'unrecognized_keys') {
          return `Field(s) '${e.keys.join(', ')}' cannot be updated for product type ${type}`
        }
        return e.message
      }).join(', ')
      throw new Error(`Validation failed: ${errorMessages}`)
    }
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
