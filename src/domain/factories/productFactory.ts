import { randomUUID } from 'crypto';
import { IFinancialProduct } from '../entities/IFinancialProduct';
import { ProductType } from '../types';

export interface IProductFactory {
  create(data: Omit<IFinancialProduct, 'id'>): IFinancialProduct;
}

export class ProductFactory implements IProductFactory {
  create(data: Omit<IFinancialProduct, 'id'>): IFinancialProduct {
    const prefix = this.getPrefix(data.type);
    const id = `${prefix}-${randomUUID()}`;

    return {
      ...data,
      id,
      valueHistory: data.valueHistory || []
    } as IFinancialProduct;
  }

  private getPrefix(type: ProductType): string {
    const prefixes: Record<ProductType, string> = {
      'CURRENT_ACCOUNT': 'CUR',
      'SAVINGS_ACCOUNT': 'SAV',
      'FIXED_TERM_DEPOSIT': 'FIX',
      'INVESTMENT_FUND': 'INV',
      'STOCKS': 'STK'
    };
    return prefixes[type] || 'GEN';
  }
}