import { IFinancialProduct } from '@domain/entities/IFinancialProduct'
import { FinancialProduct } from '@domain/factories/financialProduct/financialProduct'
import { FinancialProductFactory } from '@domain/factories/financialProductFactory'
import { IProductRepository } from '@domain/repository/IProductRepository'
import {
  CreateProductDto,
  UpdateProductDto,
} from '@application/dtos/productDto'

export class ProductUseCases {
  constructor(private productRepository: IProductRepository) {}

  async getProducts(
    filters: Partial<IFinancialProduct>
  ): Promise<FinancialProduct[]> {
    return this.productRepository.findAll(filters)
  }

  async getProductById(id: string): Promise<FinancialProduct | null> {
    return this.productRepository.findById(id)
  }

  async getProductHistory(
    id: string
  ): Promise<Array<{ date: Date; value: number }> | null> {
    const product = await this.productRepository.findById(id)
    if (!product) {
      return null
    }
    return product.valueHistory || []
  }

  async createProduct(
    productData: CreateProductDto,
    uuid: any
  ): Promise<FinancialProduct> {
    const product = FinancialProductFactory.create(productData, uuid)
    return this.productRepository.create(product)
  }

  async updateProduct(
    id: string,
    productData: UpdateProductDto
  ): Promise<void> {
    const existingProduct = await this.productRepository.findById(id)
    if (!existingProduct) {
      throw new Error('Product not found')
    }

    const productEntity =
      existingProduct instanceof FinancialProduct
        ? existingProduct
        : FinancialProductFactory.fromPrimitives(existingProduct)

    const updatedProduct = productEntity.update(productData)

    await this.productRepository.update(id, updatedProduct)
  }

  async deleteProduct(id: string): Promise<void> {
    const existingProduct = await this.productRepository.findById(id)
    if (!existingProduct) {
      throw new Error('Product not found')
    }
    await this.productRepository.delete(id)
  }
}
