import { IFinancialProduct } from '../../domain/entities/financial-product';
import { IProductFactory } from '../../domain/factories/product.factory';
import { IProductRepository } from '../../domain/productRepository';
import { CreateProductDto, UpdateProductDto } from '../dtos/product.dto';

export class ProductUseCases {
  constructor(
    private productRepository: IProductRepository,
    private productFactory: IProductFactory
  ) {}

  async getProducts(filters: Partial<IFinancialProduct>): Promise<IFinancialProduct[]> {
    return this.productRepository.findAll(filters);
  }

  async getProductById(id: string): Promise<IFinancialProduct | null> {
    return this.productRepository.findById(id);
  }

  async getProductHistory(id: string): Promise<Array<{ date: Date; value: number }> | null> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      return null;
    }
    return product.valueHistory || [];
  }

  async createProduct(productData: CreateProductDto): Promise<IFinancialProduct> {
    if (!productData.name || !productData.type || !productData.financialEntity || !productData.status) {
      throw new Error('Missing required fields');
    }
    const product = this.productFactory.create(productData);
    return this.productRepository.create(product);
  }

  async updateProduct(id: string, productData: UpdateProductDto): Promise<void> {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }
    await this.productRepository.update(id, productData);
  }

  async deleteProduct(id: string): Promise<void> {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }
    await this.productRepository.delete(id);
  }
}