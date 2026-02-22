import { describe, it, expect } from 'vitest'
import { ProductTransaction } from '../../src/domain/models/productTransaction'

describe('ProductTransaction', () => {
  it('fromPrimitives should return instance', () => {
    const tx = ProductTransaction.fromPrimitives({
      id: '1',
      productId: 'p1',
      description: 'd',
      amount: 10,
      date: new Date(),
    })
    expect(tx).toBeInstanceOf(ProductTransaction)
  })
})
