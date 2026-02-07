import { IProductTransactionRepository } from '@domain/repository/IProductTransactionRepository'
import { IProductRepository } from '@domain/repository/IProductRepository'
import { ProductType } from '@domain/types'
import { ProductTransactionDto } from '@application/dtos/productTransactionDto'
import {
  IProductTransaction,
  IProductTransactionDetail,
} from '@domain/entities/IProductTransaction'

interface AddTransactionRequest extends ProductTransactionDto {
  userId: string
  productId: string
}

export class ProductTransactionUseCases {
  constructor(
    private readonly productTransactionRepository: IProductTransactionRepository,
    private readonly productRepository: IProductRepository
  ) {}

  async add(request: AddTransactionRequest): Promise<void> {
    const { userId, productId, description, date, amount } = request

    // 1. Verificar existencia del producto
    const product = await this.productRepository.findById(productId)

    if (!product) {
      throw new Error('Product not found')
    }

    // 2. Verificar propiedad (Security)
    if (product.clientId !== userId) {
      throw new Error('Unauthorized access to product')
    }

    // 3. Validar Tipo de Producto (Business Rule)
    const allowedTypes: ProductType[] = ['CURRENT_ACCOUNT', 'SAVINGS_ACCOUNT']
    if (!allowedTypes.includes(product.type)) {
      throw new Error(
        `Transactions are not allowed for product type: ${product.type}`
      )
    }

    // 4. Persistir
    await this.productTransactionRepository.addTransaction({
      productId,
      description,
      date,
      amount,
    } as IProductTransaction)
  }

  async getProductTransactions(
    productId: string
  ): Promise<IProductTransactionDetail[]> {
    // Verificamos que el producto exista antes de buscar sus transacciones
    const product = await this.productRepository.findById(productId)
    if (!product) {
      throw new Error('Product not found')
    }
    return this.productTransactionRepository.findAllByProductId(productId)
  }
}
