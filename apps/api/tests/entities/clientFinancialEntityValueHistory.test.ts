import { describe, it, expect } from 'vitest'
import { ClientFinancialEntityValueHistory } from '../../src/domain/models/clientFinancialEntityValueHistory'

describe('ClientFinancialEntityValueHistory Domain Model', () => {
  describe('create', () => {
    it('should throw if date is missing', () => {
      expect(() =>
        ClientFinancialEntityValueHistory.create({
          value: 100,
          clientFinancialEntityId: '1',
        } as any)
      ).toThrow('Date is required')
    })
    it('should throw if value is missing', () => {
      expect(() =>
        ClientFinancialEntityValueHistory.create({
          date: new Date(),
          clientFinancialEntityId: '1',
        } as any)
      ).toThrow('Value is required')
    })
    it('should throw if clientFinancialEntityId is missing', () => {
      expect(() =>
        ClientFinancialEntityValueHistory.create({
          date: new Date(),
          value: 100,
        } as any)
      ).toThrow('Client Financial Entity ID is required')
    })
    it('should create instance if valid', () => {
      const vh = ClientFinancialEntityValueHistory.create({
        date: new Date(),
        value: 100,
        clientFinancialEntityId: '1',
      })
      expect(vh).toBeInstanceOf(ClientFinancialEntityValueHistory)
    })
  })
})
