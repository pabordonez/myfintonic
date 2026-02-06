import { IProductTransaction } from '@domain/entities/IProductTransaction'

export interface AddTransactionParams {
  productId: string
  description: string
  date: Date
  amount: number
}

export interface IProductTransactionRepository {
  findById(id: string): Promise<IProductTransaction | null>
  findAllByProductId(productId: string): Promise<IProductTransaction[]>
  addTransaction(params: AddTransactionParams): Promise<IProductTransaction>
}