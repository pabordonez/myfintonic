import {
  IProductTransactionDetail,
  ProductTransaction,
} from '@domain/models/productTransaction'

export interface IProductTransactionRepository {
  findById(id: string): Promise<IProductTransactionDetail | null>
  findAllByProductId(productId: string): Promise<IProductTransactionDetail[]>
  addTransaction(
    transaction: ProductTransaction
  ): Promise<IProductTransactionDetail>
}
