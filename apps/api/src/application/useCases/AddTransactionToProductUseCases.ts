import { IProductTransactionRepository } from '@domain/repository/IProductTransactionRepository'
import { ProductType } from '@domain/types'
import { AddTransactionDto } from '@application/dtos/AddTransactionDto'

interface IAddTransaction extends AddTransactionDto {
  userId: string
  productId: string
}

export class AddTransactionToProductUseCases {
  constructor(private readonly productTransactionRepository: IProductTransactionRepository) {}

  async execute(request: IAddTransaction): Promise<void> {
    const { userId, productId, description, date, amount } = request

    // 1. Verificar existencia del producto
    const product = await this.productTransactionRepository.findById(productId)

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
      throw new Error(`Transactions are not allowed for product type: ${product.type}`)
    }

    // 4. Persistir
    await this.productTransactionRepository.addTransaction({
      productId,
      description,
      date,
      amount,
    })
  }
}
