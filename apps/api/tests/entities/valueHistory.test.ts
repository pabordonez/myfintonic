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
      const vh = ValueHistory.create({ date: new Date(), value: 100 })
      expect(vh).toBeInstanceOf(ValueHistory)
    })
  })
})
