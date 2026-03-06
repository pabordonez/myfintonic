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
})
