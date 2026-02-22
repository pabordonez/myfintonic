import { IProductTransactionRepository } from '@domain/repository/IProductTransactionRepository'
import { IProductRepository } from '@domain/repository/IProductRepository'
import { ProductType } from '@domain/types'
import { ProductTransactionDto } from '@application/dtos/productTransactionDto'
import { IProductTransactionDetail } from '@domain/entities/IProductTransaction'
import { productTransactionEntity } from '@domain/factories/productTransactionEntity'

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

    if (product.status !== 'ACTIVE') {
      throw new Error('Transaction failed: Product is not active')
    }

    const allowedTypes: ProductType[] = ['CURRENT_ACCOUNT', 'SAVINGS_ACCOUNT']
    if (!allowedTypes.includes(product.type)) {
      throw new Error(
        `Transactions are not allowed for product type: ${product.type}`
      )
    }

    const transaction = productTransactionEntity.create(
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
