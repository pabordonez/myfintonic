import { IProductTransactionRepository } from '@domain/repository/IProductTransactionRepository'
import { IProductRepository } from '@domain/repository/IProductRepository'
import { ProductTransactionDto } from '@application/dtos/productTransactionDto'
import {
  IProductTransactionDetail,
  ProductTransaction,
} from '@domain/models/productTransaction'

export class ProductTransactionUseCases {
  constructor(
    private readonly productTransactionRepository: IProductTransactionRepository,
    private readonly productRepository: IProductRepository
  ) {}

  async add(
    productTransactionDto: ProductTransactionDto,
    uuid: string
  ): Promise<void> {
    const { userId, productId, description, date, amount } =
      productTransactionDto

    const product = await this.productRepository.findById(productId)

    if (!product) {
      throw new Error('Product not found')
    }

    if (product.clientId !== userId) {
      throw new Error('Unauthorized access to product')
    }

    // Delegamos la validación a la entidad rica (Polimorfismo)
    product.validateTransaction()

    const transaction = ProductTransaction.create(
      {
        productId,
        description,
        date,
        amount,
      },
      uuid
    )

    await this.productTransactionRepository.addTransaction(transaction)
  }

  async getProductTransactions(
    productId: string
  ): Promise<IProductTransactionDetail[]> {
    const product = await this.productRepository.findById(productId)
    if (!product) {
      throw new Error('Product not found')
    }
    return this.productTransactionRepository.findAllByProductId(productId)
  }
}
