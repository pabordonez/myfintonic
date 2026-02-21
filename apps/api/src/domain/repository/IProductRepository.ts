// Domain Repository Interface
import { IFinancialProduct } from '@domain/entities/IFinancialProduct'
import { FinancialProduct } from '@domain/factories/financialProduct/financialProduct'

export interface IProductRepository {
  findAll(filters?: Partial<IFinancialProduct>): Promise<FinancialProduct[]>
  findById(id: string): Promise<FinancialProduct | null>
  create(product: IFinancialProduct): Promise<FinancialProduct>
  update(id: string, product: Partial<IFinancialProduct>): Promise<void>
  delete(id: string): Promise<void>
}
