import { describe, it, expect } from 'vitest'
import { ClientFinancialEntity } from '../../src/domain/models/clientFinancialEntity'

describe('ClientFinancialEntity', () => {
  it('create should throw if financialEntityId is missing', () => {
    expect(() =>
      ClientFinancialEntity.create({ clientId: 'c1' } as any, 'id')
    ).toThrow('Financial Entity ID is required')
  })

  it('create should throw if clientId is missing', () => {
    expect(() =>
      ClientFinancialEntity.create({ financialEntityId: 'f1' } as any, 'id')
    ).toThrow('Client ID is required')
  })

  it('fromPrimitives should return instance', () => {
    const entity = ClientFinancialEntity.fromPrimitives({
      id: '1',
      clientId: 'c1',
      financialEntityId: 'f1',
    })
    expect(entity).toBeInstanceOf(ClientFinancialEntity)
  })
})
