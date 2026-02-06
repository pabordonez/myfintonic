import { IFinancialProduct } from '@domain/entities/IFinancialProduct'
import { ProductTransaction } from '@domain/entities/ProductTransaction'

export interface AddTransactionParams {
  productId: string
  description: string
  date: Date
  amount: number
}

export interface IProductTransactionRepository {
  findById(id: string): Promise<IFinancialProduct | null>
  addTransaction(params: AddTransactionParams): Promise<ProductTransaction>
}