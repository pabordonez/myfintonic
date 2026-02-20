import { IFinancialProduct } from '@domain/entities/IFinancialProduct'
import { IProductFactory } from '@domain/factories/productService'
import { IProductRepository } from '@domain/repository/IProductRepository'
import {
  CreateProductDto,
  UpdateProductDto,
} from '@application/dtos/productDto'

export class ProductUseCases {
  constructor(
    private productRepository: IProductRepository,
    private productFactory: IProductFactory
  ) {}

  async getProducts(
    filters: Partial<IFinancialProduct>
  ): Promise<IFinancialProduct[]> {
    return this.productRepository.findAll(filters)
  }

  async getProductById(id: string): Promise<IFinancialProduct | null> {
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
  ): Promise<IFinancialProduct> {
    const product = this.productFactory.create(productData, uuid)
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
    const updatedProduct = this.productFactory.update(
      existingProduct,
      productData
    )

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
