import { describe, it, expect } from 'vitest'
import { productTransactionEntity } from '../../src/domain/factories/productTransactionEntity'

describe('productTransactionEntity', () => {
  it('fromPrimitives should return instance', () => {
    const tx = productTransactionEntity.fromPrimitives({
      id: '1',
      productId: 'p1',
      description: 'd',
      amount: 10,
      date: new Date(),
    })
    expect(tx).toBeInstanceOf(productTransactionEntity)
  })
})
