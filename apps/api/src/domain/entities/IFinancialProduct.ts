import {
  ProductStatus,
  ProductType,
  InterestPaymentFrequency,
} from '@domain/types'
import { IProductTransaction } from '@domain/entities/IProductTransaction'

export interface IFinancialProduct {
  id?: string
  type: ProductType
  name: string
  financialEntity: string
  status: ProductStatus
  clientId: string
  valueHistory?: Array<{ date: Date; value: number }>
  transaction?: Array<IProductTransaction>
  currentBalance?: number
  createdAt: Date
  updatedAt: Date
}

export interface ICurrentAccount extends IFinancialProduct {
  type: 'CURRENT_ACCOUNT'
  currentBalance: number
  transactions: Array<{ date: Date; description: string; amount: number }>
}

export interface ISavingsAccount extends IFinancialProduct {
  type: 'SAVINGS_ACCOUNT'
  currentBalance: number
  monthlyInterestRate: number
}

export interface IFixedTermDeposit extends IFinancialProduct {
  type: 'FIXED_TERM_DEPOSIT'
  initialBalance: number
  initialDate: Date
  maturityDate: Date
  annualInterestRate: number
  interestPaymentFrequency: InterestPaymentFrequency
}

export interface IInvestmentFund extends IFinancialProduct {
  type: 'INVESTMENT_FUND'
  currentBalance: number
  numberOfUnits?: number
  netAssetValue?: number
  fees?: {
    opening: number
    closing: number
    maintenance: number
  }
}

export interface IStocks extends IFinancialProduct {
  type: 'STOCKS'
  initialBalance: number
  currentBalance: number
  numberOfShares: number
  unitPurchasePrice: number
  currentMarketPrice: number
  fees?: {
    buying: number
    selling: number
  }
}
