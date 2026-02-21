import { ProductStatus, ProductType } from '@domain/types'
import { IProductTransaction } from '@domain/entities/IProductTransaction'

export interface IFinancialProduct {
  id?: string
  type: ProductType
  name: string
  financialEntity: string
  financialEntityName?: string
  status: ProductStatus
  clientId: string
  valueHistory?: Array<{ date: Date; value: number }>
  transaction?: Array<IProductTransaction>
  currentBalance?: number
  createdAt: Date
  updatedAt: Date
}
