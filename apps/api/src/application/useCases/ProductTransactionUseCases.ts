import { IProductTransactionRepository } from '@domain/repository/IProductTransactionRepository'
import { IProductRepository } from '@domain/repository/IProductRepository'
import { ProductTransactionDto } from '@application/dtos/productTransactionDto'
import {
  IProductTransaction,
  IProductTransactionDetail,
} from '@domain/entities/IProductTransaction'
import { FinancialProductFactory } from '@domain/factories/financialProductFactory'
import {
  BankingTransactionPolicy,
  InvestmentTransactionPolicy,
} from '@domain/strategies/transactionPolicy'

export class ProductTransactionUseCases {
  constructor(
    private readonly productTransactionRepository: IProductTransactionRepository,
    private readonly productRepository: IProductRepository
  ) {}

  async add(productTransactionDto: ProductTransactionDto): Promise<void> {
    const { userId, productId, description, date, amount } =
      productTransactionDto

    const productData = await this.productRepository.findById(productId)

    if (!productData) {
      throw new Error('Product not found')
    }

    // 1. Hidratamos el Modelo Rico
    const product = FinancialProductFactory.fromPrimitives(productData)

    // 2. Lógica de Dominio: Verificación de Propiedad
    if (!product.isOwnedBy(userId)) {
      throw new Error('Unauthorized access to product')
    }

    // 3. Lógica de Dominio: Validación vía Strategy
    // El Caso de Uso decide QUÉ política aplicar, la Entidad decide CÓMO ejecutarse con ella.
    const policy = ['CURRENT_ACCOUNT', 'SAVINGS_ACCOUNT'].includes(product.type)
      ? new BankingTransactionPolicy()
      : new InvestmentTransactionPolicy()

    product.validateTransaction(policy)

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
    const product = await this.productRepository.findById(productId)
    if (!product) {
      throw new Error('Product not found')
    }
    return this.productTransactionRepository.findAllByProductId(productId)
  }
}
