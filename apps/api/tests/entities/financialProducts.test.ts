import { describe, it, expect } from 'vitest'
import { FinancialProductFactory } from '../../src/domain/factories/financialProductFactory'
import { FixedTermDeposit } from '../../src/domain/models/financialProduct/fixedTermDeposit'
import { InvestmentFund } from '../../src/domain/models/financialProduct/investmentFund'
import { SavingsAccount } from '../../src/domain/models/financialProduct/savingsAccount'
import { Stocks } from '../../src/domain/models/financialProduct/stocks'
import { CurrentAccount } from '../../src/domain/models/financialProduct/currentAccount'

describe('Financial Products Domain Models', () => {
  describe('FinancialProduct Base', () => {
    it('should allow transaction for active CurrentAccount', () => {
      const account = CurrentAccount.create({
        type: 'CURRENT_ACCOUNT',
        currentBalance: 100,
        status: 'ACTIVE',
      } as any)
      expect(() => account.validateTransaction()).not.toThrow()
    })

    it('should throw error if product is not active (CurrentAccount)', () => {
      const account = CurrentAccount.create({
        type: 'CURRENT_ACCOUNT',
        currentBalance: 100,
        status: 'INACTIVE',
      } as any)
      expect(() => account.validateTransaction()).toThrow(
        'Transaction failed: Product is not active'
      )
    })

    it('should throw error for investment products (Default Behavior)', () => {
      const fund = InvestmentFund.create({
        type: 'INVESTMENT_FUND',
        currentBalance: 1000,
        status: 'ACTIVE',
      } as any)
      expect(() => fund.validateTransaction()).toThrow(
        'Transactions are not allowed for product type: INVESTMENT_FUND'
      )
    })

    it('should throw error if updating invalid field', () => {
      const account = CurrentAccount.create({
        type: 'CURRENT_ACCOUNT',
        currentBalance: 100,
      } as any)
      expect(() => account.update({ invalidField: 1 })).toThrow(
        "Validation failed: Field(s) 'invalidField' cannot be updated for product type CURRENT_ACCOUNT"
      )
    })

    it('should update common fields (name, status) and update timestamp', () => {
      const account = CurrentAccount.create({
        type: 'CURRENT_ACCOUNT',
        currentBalance: 100,
        status: 'ACTIVE',
        name: 'Old Name',
      } as any)

      const originalUpdatedAt = account.updatedAt
      const updated = account.update({ name: 'New Name', status: 'PAUSED' })

      expect(updated.name).toBe('New Name')
      expect(updated.status).toBe('PAUSED')
      expect(updated.updatedAt).not.toBe(originalUpdatedAt)
    })

    it('should only update timestamp when update payload is empty', () => {
      const account = CurrentAccount.create({
        type: 'CURRENT_ACCOUNT',
        currentBalance: 100,
        status: 'ACTIVE',
        name: 'Test Name',
      } as any)

      const originalUpdatedAt = account.updatedAt
      const updated = account.update({})

      expect(updated.name).toBe('Test Name')
      expect(updated.status).toBe('ACTIVE')
      expect(updated.updatedAt).not.toBe(originalUpdatedAt)
    })

    it('should expose all common properties via getters', () => {
      const now = new Date()
      const account = FinancialProductFactory.fromPrimitives({
        id: 'id-1',
        type: 'CURRENT_ACCOUNT',
        currentBalance: 100,
        status: 'ACTIVE',
        name: 'Test Account',
        createdAt: now,
        updatedAt: now,
        clientId: 'client-1',
        financialEntity: 'fe-1',
        valueHistory: [],
        transactions: [],
      })

      expect(account.id).toBe('id-1')
      expect(account.name).toBe('Test Account')
      expect(account.status).toBe('ACTIVE')
      expect(account.type).toBe('CURRENT_ACCOUNT')
      expect(account.createdAt).toEqual(now)
      expect(account.updatedAt).toEqual(now)
      expect(account.clientId).toBe('client-1')
      expect(account.financialEntity).toBe('fe-1')
      expect(account.valueHistory).toEqual([])
      expect(account.transactions).toEqual([])
    })

    it('should verify ownership correctly', () => {
      const account = FinancialProductFactory.fromPrimitives({
        id: 'id-1',
        type: 'CURRENT_ACCOUNT',
        currentBalance: 100,
        status: 'ACTIVE',
        name: 'Test Account',
        createdAt: new Date(),
        updatedAt: new Date(),
        clientId: 'client-1',
        financialEntity: 'fe-1',
        valueHistory: [],
        transactions: [],
      })

      expect(account.isOwnedBy('client-1')).toBe(true)
      expect(account.isOwnedBy('other-client')).toBe(false)
    })

    it('should return common update fields', () => {
      const account = FinancialProductFactory.fromPrimitives({
        id: 'id-1',
        type: 'CURRENT_ACCOUNT',
        currentBalance: 100,
        status: 'ACTIVE',
        name: 'Test Account',
        createdAt: new Date(),
        updatedAt: new Date(),
        clientId: 'client-1',
        financialEntity: 'fe-1',
        valueHistory: [],
        transactions: [],
      })

      // Access protected method for testing purposes
      const commonFields = (account as any).getCommonUpdateFields()
      expect(commonFields).toEqual([
        'name',
        'status',
        'financialEntity',
        'clientId',
      ])
    })
  })

  describe('FixedTermDeposit', () => {
    it('should throw if type is invalid', () => {
      expect(() => FixedTermDeposit.create({ type: 'INVALID' })).toThrow(
        'Invalid product type'
      )
    })
    it('should throw if initialBalance is missing', () => {
      expect(() =>
        FixedTermDeposit.create({ type: 'FIXED_TERM_DEPOSIT' })
      ).toThrow('Missing required field: initialBalance')
    })
    it('should throw if initialDate is missing', () => {
      expect(() =>
        FixedTermDeposit.create({
          type: 'FIXED_TERM_DEPOSIT',
          initialBalance: 100,
        })
      ).toThrow('Missing required field: initialDate')
    })
    it('should throw if maturityDate is missing', () => {
      expect(() =>
        FixedTermDeposit.create({
          type: 'FIXED_TERM_DEPOSIT',
          initialBalance: 100,
          initialDate: new Date(),
        })
      ).toThrow('Missing required field: maturityDate')
    })
    it('should throw if annualInterestRate is missing', () => {
      expect(() =>
        FixedTermDeposit.create({
          type: 'FIXED_TERM_DEPOSIT',
          initialBalance: 100,
          initialDate: new Date(),
          maturityDate: new Date(),
        })
      ).toThrow('Missing required field: annualInterestRate')
    })
    it('should throw if interestPaymentFreq is missing', () => {
      expect(() =>
        FixedTermDeposit.create({
          type: 'FIXED_TERM_DEPOSIT',
          initialBalance: 100,
          initialDate: new Date(),
          maturityDate: new Date(),
          annualInterestRate: 0.05,
        })
      ).toThrow('Missing required field: interestPaymentFreq')
    })
    it('should throw if interestPaymentFreq is invalid', () => {
      expect(() =>
        FixedTermDeposit.create({
          type: 'FIXED_TERM_DEPOSIT',
          initialBalance: 100,
          initialDate: new Date(),
          maturityDate: new Date(),
          annualInterestRate: 0.05,
          interestPaymentFreq: 'INVALID',
        })
      ).toThrow('Validation failed: Invalid interestPaymentFrequency')
    })
    it('should create successfully', () => {
      const deposit = FixedTermDeposit.create({
        type: 'FIXED_TERM_DEPOSIT',
        initialBalance: 100,
        initialDate: new Date(),
        maturityDate: new Date(),
        annualInterestRate: 0.05,
        interestPaymentFreq: 'Monthly',
      })
      expect(deposit).toBeInstanceOf(FixedTermDeposit)
    })
  })

  describe('InvestmentFund', () => {
    it('should throw if type is invalid', () => {
      expect(() => InvestmentFund.create({ type: 'INVALID' })).toThrow(
        'Invalid product type'
      )
    })
    it('should throw if currentBalance is missing', () => {
      expect(() => InvestmentFund.create({ type: 'INVESTMENT_FUND' })).toThrow(
        'Missing required field: currentBalance'
      )
    })
    it('should create successfully', () => {
      const fund = InvestmentFund.create({
        type: 'INVESTMENT_FUND',
        currentBalance: 1000,
      })
      expect(fund).toBeInstanceOf(InvestmentFund)
    })
    it('should update correctly (createCopy)', () => {
      const fund = InvestmentFund.create({
        type: 'INVESTMENT_FUND',
        currentBalance: 1000,
      })
      const updated = fund.update({ currentBalance: 2000 })
      expect(updated).toBeInstanceOf(InvestmentFund)
      expect((updated as InvestmentFund).currentBalance).toBe(2000)
    })
  })

  describe('SavingsAccount', () => {
    it('should throw if type is invalid', () => {
      expect(() => SavingsAccount.create({ type: 'INVALID' })).toThrow(
        'Invalid product type'
      )
    })
    it('should throw if currentBalance is missing', () => {
      expect(() => SavingsAccount.create({ type: 'SAVINGS_ACCOUNT' })).toThrow(
        'Missing required field: currentBalance'
      )
    })
    it('should throw if monthlyInterestRate is missing', () => {
      expect(() =>
        SavingsAccount.create({ type: 'SAVINGS_ACCOUNT', currentBalance: 100 })
      ).toThrow('Missing required field: monthlyInterestRate')
    })
    it('should create successfully', () => {
      const account = SavingsAccount.create({
        type: 'SAVINGS_ACCOUNT',
        currentBalance: 100,
        monthlyInterestRate: 0.01,
      })
      expect(account).toBeInstanceOf(SavingsAccount)
    })
    it('should update correctly (createCopy)', () => {
      const account = SavingsAccount.create({
        type: 'SAVINGS_ACCOUNT',
        currentBalance: 100,
        monthlyInterestRate: 0.01,
      })
      const updated = account.update({ currentBalance: 200 })
      expect(updated).toBeInstanceOf(SavingsAccount)
      expect((updated as SavingsAccount).currentBalance).toBe(200)
    })
    it('should allow transaction if active', () => {
      const account = SavingsAccount.create({
        type: 'SAVINGS_ACCOUNT',
        currentBalance: 100,
        monthlyInterestRate: 0.01,
        status: 'ACTIVE',
      } as any)
      expect(() => account.validateTransaction()).not.toThrow()
    })
    it('should throw error if product is not active (SavingsAccount)', () => {
      const account = SavingsAccount.create({
        type: 'SAVINGS_ACCOUNT',
        currentBalance: 100,
        monthlyInterestRate: 0.01,
        status: 'INACTIVE',
      } as any)
      expect(() => account.validateTransaction()).toThrow(
        'Transaction failed: Product is not active'
      )
    })
  })

  describe('Stocks', () => {
    it('should throw if type is invalid', () => {
      expect(() => Stocks.create({ type: 'INVALID' })).toThrow(
        'Invalid product type'
      )
    })
    it('should throw if numberOfShares is missing', () => {
      expect(() => Stocks.create({ type: 'STOCKS' })).toThrow(
        'Missing required field: numberOfShares'
      )
    })
    it('should throw if unitPurchasePrice is missing', () => {
      expect(() =>
        Stocks.create({ type: 'STOCKS', numberOfShares: 10 })
      ).toThrow('Missing required field: unitPurchasePrice')
    })
    it('should throw if currentMarketPrice is missing', () => {
      expect(() =>
        Stocks.create({
          type: 'STOCKS',
          numberOfShares: 10,
          unitPurchasePrice: 100,
        })
      ).toThrow('Missing required field: currentMarketPrice')
    })
    it('should throw if initialBalance is missing', () => {
      expect(() =>
        Stocks.create({
          type: 'STOCKS',
          numberOfShares: 10,
          unitPurchasePrice: 100,
          currentMarketPrice: 110,
        })
      ).toThrow('Missing required field: initialBalance')
    })
    it('should create successfully', () => {
      const stock = Stocks.create({
        type: 'STOCKS',
        numberOfShares: 10,
        unitPurchasePrice: 100,
        currentMarketPrice: 110,
        initialBalance: 1000,
        currentBalance: 1100,
      })
      expect(stock).toBeInstanceOf(Stocks)
    })
  })

  describe('CurrentAccount', () => {
    it('should throw if type is invalid', () => {
      expect(() => CurrentAccount.create({ type: 'INVALID' })).toThrow(
        'Invalid product type'
      )
    })
    it('should throw if currentBalance is missing', () => {
      expect(() => CurrentAccount.create({ type: 'CURRENT_ACCOUNT' })).toThrow(
        'Missing required field: currentBalance'
      )
    })
    it('should create successfully', () => {
      const account = CurrentAccount.create({
        type: 'CURRENT_ACCOUNT',
        currentBalance: 100,
      })
      expect(account).toBeInstanceOf(CurrentAccount)
    })
  })
})
