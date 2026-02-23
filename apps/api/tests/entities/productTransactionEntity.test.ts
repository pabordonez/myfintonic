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

  describe('create', () => {
    it('should throw if productId is missing', () => {
      expect(() =>
        ProductTransaction.create(
          { description: 'd', amount: 10, date: new Date() } as any,
          '1'
        )
      ).toThrow('Product ID is required')
    })
    it('should throw if description is missing', () => {
      expect(() =>
        ProductTransaction.create(
          { productId: 'p1', amount: 10, date: new Date() } as any,
          '1'
        )
      ).toThrow('Description is required')
    })
    it('should throw if amount is zero', () => {
      expect(() =>
        ProductTransaction.create(
          {
            productId: 'p1',
            description: 'd',
            amount: 0,
            date: new Date(),
          } as any,
          '1'
        )
      ).toThrow('Amount cannot be zero')
    })
    it('should throw if date is missing', () => {
      expect(() =>
        ProductTransaction.create(
          { productId: 'p1', description: 'd', amount: 10 } as any,
          '1'
        )
      ).toThrow('Date is required')
    })
  })
})
