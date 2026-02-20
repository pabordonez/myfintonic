import { IFinancialProduct } from '@domain/entities/IFinancialProduct'
import { ProductType } from '@domain/types'

export interface IProductFactory {
  create(data: Omit<IFinancialProduct, 'id'>, uuid: string): IFinancialProduct
  update(existingProduct: IFinancialProduct, data: any): IFinancialProduct
}

// Campos comunes permitidos en actualización para todos los productos
const COMMON_UPDATE_FIELDS = ['name', 'status', 'financialEntity', 'clientId']

// --- Estrategias de Validación y Creación por Tipo ---

interface ProductStrategy {
  validate(data: any): void
  getAllowedUpdateFields(): string[]
}

class CurrentAccountStrategy implements ProductStrategy {
  validate(data: any): void {
    if (data.currentBalance === undefined)
      throw new Error('Missing required field: currentBalance')
  }
  getAllowedUpdateFields() {
    return ['currentBalance', 'transactions']
  }
}

class SavingsAccountStrategy implements ProductStrategy {
  validate(data: any): void {
    if (data.currentBalance === undefined)
      throw new Error('Missing required field: currentBalance')
    if (data.monthlyInterestRate === undefined)
      throw new Error('Missing required field: monthlyInterestRate')
  }
  getAllowedUpdateFields() {
    return ['currentBalance', 'monthlyInterestRate', 'transactions']
  }
}

class FixedTermDepositStrategy implements ProductStrategy {
  validate(data: any): void {
    if (data.initialBalance === undefined)
      throw new Error('Missing required field: initialBalance')
    if (!data.initialDate)
      throw new Error('Missing required field: initialDate')
    if (!data.maturityDate)
      throw new Error('Missing required field: maturityDate')
    if (data.annualInterestRate === undefined)
      throw new Error('Missing required field: annualInterestRate')
    if (!data.interestPaymentFrequency)
      throw new Error('Missing required field: interestPaymentFrequency')

    const validFrequencies = ['Monthly', 'Quarterly', 'Annual', 'AtMaturity']
    if (!validFrequencies.includes(data.interestPaymentFrequency)) {
      throw new Error(
        `Validation failed: Invalid interestPaymentFrequency. Allowed values: ${validFrequencies.join(', ')}`
      )
    }
  }
  getAllowedUpdateFields() {
    return [
      'initialBalance',
      'currentBalance',
      'initialDate',
      'maturityDate',
      'annualInterestRate',
      'interestPaymentFrequency',
    ]
  }
}

class InvestmentFundStrategy implements ProductStrategy {
  validate(data: any): void {
    if (data.currentBalance === undefined)
      throw new Error('Missing required field: currentBalance')
  }
  getAllowedUpdateFields() {
    return ['numberOfUnits', 'netAssetValue', 'currentBalance', 'fees']
  }
}

class StocksStrategy implements ProductStrategy {
  validate(data: any): void {
    if (data.numberOfShares === undefined)
      throw new Error('Missing required field: numberOfShares')
    if (data.unitPurchasePrice === undefined)
      throw new Error('Missing required field: unitPurchasePrice')
    if (data.currentMarketPrice === undefined)
      throw new Error('Missing required field: currentMarketPrice')
    if (data.initialBalance === undefined)
      throw new Error('Missing required field: initialBalance')
  }
  getAllowedUpdateFields() {
    return [
      'numberOfShares',
      'unitPurchasePrice',
      'currentMarketPrice',
      'currentBalance',
      'initialBalance',
      'fees',
    ]
  }
}

export class ProductFactory implements IProductFactory {
  private strategies: Record<ProductType, ProductStrategy>

  constructor() {
    this.strategies = {
      CURRENT_ACCOUNT: new CurrentAccountStrategy(),
      SAVINGS_ACCOUNT: new SavingsAccountStrategy(),
      FIXED_TERM_DEPOSIT: new FixedTermDepositStrategy(),
      INVESTMENT_FUND: new InvestmentFundStrategy(),
      STOCKS: new StocksStrategy(),
    }
  }

  create<IFinancialProductCreate extends IFinancialProduct>(
    data: Omit<IFinancialProductCreate, 'id'>,
    uuid: string
  ): IFinancialProductCreate {
    // 1. Validaciones Comunes
    if (!data.name || !data.type || !data.financialEntity || !data.status) {
      throw new Error('Missing required fields')
    }

    // 2. Validaciones Específicas (Delegación)
    const strategy = this.strategies[data.type]
    if (strategy) {
      strategy.validate(data)
    }

    const prefix = this.getPrefix(data.type)
    const id = `${prefix}-${uuid}`
    const now = new Date()

    return {
      ...data,
      id,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
      valueHistory: data.valueHistory || [],
    } as unknown as IFinancialProductCreate
  }

  update(existingProduct: IFinancialProduct, data: any): IFinancialProduct {
    if (!data) throw new Error('No data provided for update')

    const type = existingProduct.type
    // 1. Obtener campos permitidos según el tipo
    const strategy = this.strategies[type]
    const specificFields = strategy ? strategy.getAllowedUpdateFields() : []
    const allowedFields = [...COMMON_UPDATE_FIELDS, ...specificFields]

    // 2. Verificar que no vengan campos extraños (Strict check)
    const receivedFields = Object.keys(data)
    const invalidFields = receivedFields.filter(
      (field) => !allowedFields.includes(field)
    )

    if (invalidFields.length > 0) {
      throw new Error(
        `Validation failed: Field(s) '${invalidFields.join(', ')}' cannot be updated for product type ${type}`
      )
    }

    // 3. Validaciones de tipo básicas (opcional, para asegurar consistencia)
    if (
      data.currentBalance !== undefined &&
      typeof data.currentBalance !== 'number'
    ) {
      throw new Error('Validation failed: currentBalance must be a number')
    }

    if (
      type === 'FIXED_TERM_DEPOSIT' &&
      data.interestPaymentFrequency !== undefined
    ) {
      const validFrequencies = ['Monthly', 'Quarterly', 'Annual', 'AtMaturity']
      if (!validFrequencies.includes(data.interestPaymentFrequency)) {
        throw new Error(`Validation failed: Invalid interestPaymentFrequency`)
      }
    }

    // 4. Retornar la entidad actualizada (Merge)
    return {
      ...existingProduct,
      ...data,
      updatedAt: new Date(),
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
