import {
  ProductStatus,
  ProductType,
  InterestPaymentFrequency,
} from '@domain/types'
import { IProductTransaction } from '@domain/entities/IProductTransaction'

export interface CreateProductDto {
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

  transactions?: Array<{ date: Date; description: string; amount: number }>
  monthlyInterestRate?: number
  initialBalance?: number
  initialDate?: Date
  maturityDate?: Date
  annualInterestRate?: number
  interestPaymentFrequency?: InterestPaymentFrequency
  numberOfUnits?: number
  netAssetValue?: number
  fees?: {
    opening: number
    closing: number
    maintenance: number
  }
  numberOfShares?: number
  unitPurchasePrice?: number
  currentMarketPrice?: number
}

export interface UpdateProductDto {
  clientId: string
  name?: string
  status?: ProductStatus

  valueHistory?: Array<{ date: Date; value: number }>
  transaction?: Array<IProductTransaction>
  currentBalance?: number

  transactions?: Array<{ date: Date; description: string; amount: number }>
  monthlyInterestRate?: number
  initialBalance?: number
  initialDate?: Date
  maturityDate?: Date
  annualInterestRate?: number
  interestPaymentFrequency?: InterestPaymentFrequency
  numberOfUnits?: number
  netAssetValue?: number
  fees?: {
    opening: number
    closing: number
    maintenance: number
  }
  numberOfShares?: number
  unitPurchasePrice?: number
  currentMarketPrice?: number
}
