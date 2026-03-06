import { describe, it, expect } from 'vitest'
import { PrismaProductMapper } from '../../src/infrastructure/persistence/prisma/mappers/PrismaProductMapper'
import { FinancialProductFactory } from '../../src/domain/factories/financialProductFactory'

describe('PrismaProductMapper', () => {
  describe('toPrismaUpdate', () => {
    it('should map all optional fields correctly', () => {
      const input = {
        monthlyInterestRate: 0.05,
        annualInterestRate: 0.03,
        numberOfUnits: 10,
        netAssetValue: 100,
        numberOfShares: 50,
        unitPurchasePrice: 10,
        currentMarketPrice: 12,
        interestPaymentFreq: 'Monthly',
      }

      const result = PrismaProductMapper.toPrismaUpdate(input)

      expect(result).toEqual(
        expect.objectContaining({
          monthlyInterestRate: 0.05,
          annualInterestRate: 0.03,
          numberOfUnits: 10,
          netAssetValue: 100,
          numberOfShares: 50,
          unitPurchasePrice: 10,
          currentMarketPrice: 12,
          interestPaymentFreq: 'Monthly',
        })
      )
    })

    it('should map dates from strings', () => {
      const input = {
        initialDate: '2023-01-01',
        maturityDate: '2023-12-31',
      }
      const result = PrismaProductMapper.toPrismaUpdate(input)
      expect(result.initialDate).toBeInstanceOf(Date)
      expect(result.maturityDate).toBeInstanceOf(Date)
    })

    it('should map dates from Date objects', () => {
      const date = new Date()
      const input = {
        initialDate: date,
        maturityDate: date,
      }
      const result = PrismaProductMapper.toPrismaUpdate(input)
      expect(result.initialDate).toBe(date)
      expect(result.maturityDate).toBe(date)
    })

    it('should map relations and history', () => {
      const date = new Date()
      const input = {
        clientId: 'c1',
        financialEntity: 'fe1',
        valueHistoryEntry: {
          date,
          value: 100,
          previousValue: 50,
        },
      }
      const result = PrismaProductMapper.toPrismaUpdate(input)
      expect(result.client).toEqual({ connect: { id: 'c1' } })
      expect(result.financialEntity).toEqual({ connect: { id: 'fe1' } })
      expect(result.valueHistory).toEqual({
        create: {
          date,
          value: 100,
          previousValue: 50,
        },
      })
    })
  })

  describe('toPrismaCreate', () => {
    const validProductData = {
      id: '1',
      name: 'Test',
      type: 'CURRENT_ACCOUNT',
      financialEntityId: 'fe1',
      clientId: 'c1',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      currentBalance: 1000,
    }

    it('should throw if product ID is missing', () => {
      const product = FinancialProductFactory.fromPrimitives(
        validProductData as any
      )
      const invalid = { ...product, id: undefined } as any
      expect(() => PrismaProductMapper.toPrismaCreate(invalid)).toThrow(
        'Product ID is required'
      )
    })

    it('should throw if client ID is missing', () => {
      const product = FinancialProductFactory.fromPrimitives(
        validProductData as any
      )
      const invalid = { ...product, clientId: undefined } as any
      expect(() => PrismaProductMapper.toPrismaCreate(invalid)).toThrow(
        'Client ID is required'
      )
    })

    it('should throw if financial entity is missing', () => {
      const product = FinancialProductFactory.fromPrimitives(
        validProductData as any
      )
      const invalid = { ...product, financialEntity: undefined } as any
      expect(() => PrismaProductMapper.toPrismaCreate(invalid)).toThrow(
        'Financial Entity is required'
      )
    })
  })

  describe('toDomain', () => {
    it('should map prisma object to domain entity', () => {
      const prismaObj = {
        id: '1',
        type: 'CURRENT_ACCOUNT',
        name: 'Test',
        financialEntityId: 'fe1',
        financialEntity: { name: 'Bank' },
        status: 'ACTIVE',
        clientId: 'c1',
        client: { firstName: 'John', lastName: 'Doe', email: 'j@d.com' },
        createdAt: new Date(),
        updatedAt: new Date(),
        currentBalance: 1000,
        valueHistory: [],
      }

      const result = PrismaProductMapper.toDomain(prismaObj)
      expect(result.id).toBe('1')
      expect(result.currentBalance).toBe(1000)
    })
  })
})
