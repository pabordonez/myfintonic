import { describe, it, expect } from 'vitest'
import { FinancialProductFactory } from '../../src/domain/factories/financialProductFactory'

describe('FinancialProductFactory', () => {
  it('should throw error for unknown product type in fromPrimitives', () => {
    expect(() =>
      FinancialProductFactory.fromPrimitives({ type: 'UNKNOWN' } as any)
    ).toThrow('Unknown product type: UNKNOWN')
  })
})
