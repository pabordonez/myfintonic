// Domain Repository Interface
import { IFinancialProduct } from '@domain/entities/IFinancialProduct'

export interface IProductRepository {
  findAll(filters?: Partial<IFinancialProduct>): Promise<IFinancialProduct[]>
  findById(id: string): Promise<IFinancialProduct | null>
  create(product: IFinancialProduct): Promise<IFinancialProduct>
  update(id: string, product: Partial<IFinancialProduct>): Promise<void>
  delete(id: string): Promise<void>
}
