import { IFinancialProduct } from '../../domain/entities/financial-product';
import { IProductRepository } from '../../domain/productRepository';

export class InMemoryProductRepository implements IProductRepository {
  private products: IFinancialProduct[] = [];

  async findAll(filters?: Partial<IFinancialProduct>): Promise<IFinancialProduct[]> {
    if (!filters || Object.keys(filters).length === 0) {
      return this.products;
    }

    return this.products.filter(product => {
      return Object.entries(filters).every(([key, value]) => {
        return product[key as keyof IFinancialProduct] === value;
      });
    });
  }

  async findById(id: string): Promise<IFinancialProduct | null> {
    return this.products.find(p => p.id === id) || null;
  }

  async create(product: IFinancialProduct): Promise<IFinancialProduct> {
    const newProduct = { ...product };
    this.products.push(newProduct);
    return newProduct;
  }

  async update(id: string, productData: Partial<IFinancialProduct>): Promise<void> {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...productData };
    }
  }

  async delete(id: string): Promise<void> {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products.splice(index, 1);
    }
  }
}