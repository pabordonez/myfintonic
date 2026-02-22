import { IProductTransactionDetail } from '@domain/entities/IProductTransaction'
import { productTransactionEntity } from '@domain/factories/productTransactionEntity'

export interface IProductTransactionRepository {
  findById(id: string): Promise<IProductTransactionDetail | null>
  findAllByProductId(productId: string): Promise<IProductTransactionDetail[]>
  addTransaction(
    transaction: productTransactionEntity
  ): Promise<IProductTransactionDetail>
}
