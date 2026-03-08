import { describe, it, expect } from 'vitest'
import { FinancialProductFactory } from '../../src/domain/factories/financialProductFactory'

describe('FinancialProductFactory', () => {
  it('should throw error for unknown product type in fromPrimitives', () => {
    expect(() =>
      FinancialProductFactory.fromPrimitives({ type: 'UNKNOWN' } as any)
    ).toThrow('Unknown product type: UNKNOWN')
  })

  it('should create product with valueHistory', () => {
    const product = FinancialProductFactory.create(
      {
        type: 'CURRENT_ACCOUNT',
        name: 'P',
        financialEntity: 'F',
        status: 'ACTIVE',
        currentBalance: 100,
        valueHistory: [{ date: new Date(), value: 100 }],
      } as any,
      'uuid'
    )
    expect(product.valueHistory).toHaveLength(1)
  })

  it('should create instances from primitives for all types', () => {
    const common = {
      id: 'uuid',
      name: 'P',
      financialEntity: 'F',
      clientId: 'C',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      currentBalance: 1000,
    }

    const types = [
      { type: 'CURRENT_ACCOUNT', extra: {} },
      { type: 'SAVINGS_ACCOUNT', extra: { monthlyInterestRate: 0.01 } },
      {
        type: 'FIXED_TERM_DEPOSIT',
        extra: {
          initialBalance: 1000,
          initialDate: new Date(),
          maturityDate: new Date(),
          annualInterestRate: 0.05,
          interestPaymentFreq: 'Monthly',
        },
      },
      {
        type: 'INVESTMENT_FUND',
        extra: { numberOfUnits: 10, netAssetValue: 100 },
      },
      {
        type: 'STOCKS',
        extra: {
          numberOfShares: 10,
          unitPurchasePrice: 100,
          currentMarketPrice: 110,
          initialBalance: 1000,
        },
      },
    ]

    types.forEach(({ type, extra }) => {
      const product = FinancialProductFactory.fromPrimitives({
        ...common,
        type: type as any,
        ...extra,
      })
      expect(product).toBeDefined()
      expect(product.type).toBe(type)
    })
  })
})
