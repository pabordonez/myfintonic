import { describe, it, expect, vi } from 'vitest'
import { FixedTermDeposit } from '../../src/domain/models/financialProduct/fixedTermDeposit'
import { InvestmentFund } from '../../src/domain/models/financialProduct/investmentFund'
import { SavingsAccount } from '../../src/domain/models/financialProduct/savingsAccount'
import { Stocks } from '../../src/domain/models/financialProduct/stocks'
import { CurrentAccount } from '../../src/domain/models/financialProduct/currentAccount'
import {
  BankingTransactionPolicy,
  InvestmentTransactionPolicy,
} from '../../src/domain/strategies/TransactionPolicy'

describe('Financial Products Domain Models', () => {
  describe('FinancialProduct Base', () => {
    it('should validate transaction using policy', () => {
      const account = CurrentAccount.create({
        type: 'CURRENT_ACCOUNT',
        currentBalance: 100,
        status: 'ACTIVE',
      } as any)
      const policy = new BankingTransactionPolicy()
      const spy = vi.spyOn(policy, 'validate')
      account.validateTransaction(policy)
      expect(spy).toHaveBeenCalledWith(account)
    })

    it('should throw error if product is not active (BankingTransactionPolicy)', () => {
      const account = CurrentAccount.create({
        type: 'CURRENT_ACCOUNT',
        currentBalance: 100,
        status: 'INACTIVE',
      } as any)
      const policy = new BankingTransactionPolicy()
      expect(() => account.validateTransaction(policy)).toThrow(
        'Transaction failed: Product is not active'
      )
    })

    it('should throw error for investment products (InvestmentTransactionPolicy)', () => {
      const fund = InvestmentFund.create({
        type: 'INVESTMENT_FUND',
        currentBalance: 1000,
        status: 'ACTIVE',
      } as any)
      const policy = new InvestmentTransactionPolicy()
      expect(() => fund.validateTransaction(policy)).toThrow(
        'Transactions are not allowed for product type: INVESTMENT_FUND'
      )
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
