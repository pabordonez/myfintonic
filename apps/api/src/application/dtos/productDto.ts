import {
  ProductStatus,
  ProductType,
  InterestPaymentFrequency,
} from '@domain/types'
import { IProductTransaction } from '@domain/entities/IProductTransaction'

export class CreateProductDto {
  type!: ProductType
  name!: string
  financialEntity!: string
  status!: ProductStatus
  clientId!: string
  valueHistory?: Array<{ date: Date; value: number }>
  transaction?: Array<IProductTransaction>
  currentBalance?: number
  createdAt?: Date
  updatedAt?: Date
  transactions?: Array<{ date: Date; description: string; amount: number }>
  monthlyInterestRate?: number
  initialBalance?: number
  initialDate?: Date
  maturityDate?: Date
  annualInterestRate?: number
  interestPaymentFreq?: InterestPaymentFrequency
  numberOfUnits?: number
  netAssetValue?: number
  numberOfShares?: number
  unitPurchasePrice?: number
  currentMarketPrice?: number
}

export class UpdateProductDto {
  clientId!: string
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
  interestPaymentFreq?: InterestPaymentFrequency
  numberOfUnits?: number
  netAssetValue?: number
  numberOfShares?: number
  unitPurchasePrice?: number
  currentMarketPrice?: number
}
