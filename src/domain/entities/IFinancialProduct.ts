import { ProductStatus, ProductType } from '../types'
import { IValueHistory } from './IValueHistory'

export interface IFinancialProduct {
  id: string
  type: ProductType
  name: string
  financialEntity: string
  status: ProductStatus
  clientId: string
  valueHistory?: IValueHistory[]
  createdAt: Date
  updatedAt?: Date
  [key: string]: any
}

export interface ICurrentAccount extends IFinancialProduct {
  type: 'CURRENT_ACCOUNT'
  currentBalance: number
  initialBalance?: number
  //TODO CAMBIAR ESTO POR UNA INTERFAZ
  transactions: Array<{ date: Date; description: string; amount: number }>
}

export interface ISavingsAccount extends IFinancialProduct {
  type: 'SAVINGS_ACCOUNT'
  currentBalance: number
  initialBalance?: number
  monthlyInterestRate: number
}

export interface IFixedTermDeposit extends IFinancialProduct {
  type: 'FIXED_TERM_DEPOSIT'
  initialCapital: number
  maturityDate: Date
  annualInterestRate: number
  interestPaymentFrequency: 'Monthly' | 'Quarterly' | 'Annual' | 'AtMaturity'
}

export interface IInvestmentFund extends IFinancialProduct {
  type: 'INVESTMENT_FUND'
  numberOfUnits: number
  netAssetValue: number
  totalPurchaseValue: number
  fees: {
    opening: number
    closing: number
    maintenance: number
  }
}

export interface IStocks extends IFinancialProduct {
  type: 'STOCKS'
  numberOfShares: number
  unitPurchasePrice: number
  currentMarketPrice: number
  fees: {
    buying: number
    selling: number
  }
}
