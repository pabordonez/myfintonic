import { IProductTransaction, IProductTransactionDetail} from '@domain/entities/IProductTransaction'

export interface IProductTransactionRepository {
  findById(id: string): Promise<IProductTransactionDetail | null>
  findAllByProductId(productId: string): Promise<IProductTransactionDetail[]>
  addTransaction(params: IProductTransaction): Promise<IProductTransactionDetail>
}