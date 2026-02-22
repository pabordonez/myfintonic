import { describe, it, expect } from 'vitest'
import { FinancialEntity } from '../../src/domain/models/financialEntity'

describe('FinancialEntity', () => {
  it('create should throw if name is empty', () => {
    expect(() => FinancialEntity.create('', 'id')).toThrow(
      'Financial Entity name is required'
    )
    expect(() => FinancialEntity.create('   ', 'id')).toThrow(
      'Financial Entity name is required'
    )
  })

  it('update should throw if name is empty', () => {
    const entity = FinancialEntity.create('Bank', 'id')
    expect(() => entity.update('')).toThrow('Financial Entity name is required')
  })

  it('update should update name and updatedAt', () => {
    const entity = FinancialEntity.create('Bank', 'id')
    const oldUpdatedAt = entity.updatedAt
    entity.update('New Bank')
    expect(entity.name).toBe('New Bank')
    expect(entity.updatedAt).not.toBe(oldUpdatedAt)
    expect(entity.updatedAt).toBeInstanceOf(Date)
  })

  it('fromPrimitives should return instance', () => {
    const entity = FinancialEntity.fromPrimitives({
      id: '1',
      name: 'Bank',
      createdAt: new Date(),
      updatedAt: null,
    })
    expect(entity).toBeInstanceOf(FinancialEntity)
  })
})
