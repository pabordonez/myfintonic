import { describe, it, expect } from 'vitest'
import { ValueHistory } from '../../src/domain/models/valueHistory'

describe('ValueHistory Domain Model', () => {
  describe('create', () => {
    it('should throw if date is missing', () => {
      expect(() => ValueHistory.create({ value: 100 } as any)).toThrow(
        'Date is required'
      )
    })
    it('should throw if value is missing', () => {
      expect(() => ValueHistory.create({ date: new Date() } as any)).toThrow(
        'Value is required'
      )
    })
    it('should create instance if valid', () => {
      const date = new Date()
      const value = 100
      const productId = 'p1'
      const vh = ValueHistory.create({ date, value, productId })
      expect(vh).toBeInstanceOf(ValueHistory)
      expect(vh.date).toBe(date)
      expect(vh.value).toBe(value)
      expect(vh.productId).toBe(productId)
    })
  })

  describe('fromPrimitives', () => {
    it('should return instance', () => {
      const date = new Date()
      const vh = ValueHistory.fromPrimitives({
        id: 1,
        date,
        value: 100,
        productId: 'p1',
      })
      expect(vh).toBeInstanceOf(ValueHistory)
      expect(vh.id).toBe(1)
      expect(vh.date).toBe(date)
      expect(vh.value).toBe(100)
      expect(vh.productId).toBe('p1')
    })
  })
})
