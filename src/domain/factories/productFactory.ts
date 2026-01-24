import { randomUUID } from 'crypto';
import { IFinancialProduct } from '../entities/IFinancialProduct';
import { ProductType } from '../types';

export interface IProductFactory {
  create(data: Omit<IFinancialProduct, 'id'>): IFinancialProduct;
}

export class ProductFactory implements IProductFactory {
  create<IFinancialProductCreate extends IFinancialProduct>(data: Omit<IFinancialProductCreate, 'id'>): IFinancialProductCreate {
    this.validate(data);

    const prefix = this.getPrefix(data.type);
    const id = `${prefix}-${randomUUID()}`;
    const now = new Date();

    return {
      ...data,
      id,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
      valueHistory: data.valueHistory || []
    } as unknown as IFinancialProductCreate;
  }

  private validate<IFinancialProductValidate extends IFinancialProduct>(data: Omit<IFinancialProductValidate, 'id'>): void {
    switch (data.type) {
      case 'CURRENT_ACCOUNT':
        if (data['currentBalance'] === undefined) throw new Error('Missing required field: currentBalance');
        break;
      case 'SAVINGS_ACCOUNT':
        if (data['currentBalance'] === undefined) throw new Error('Missing required field: currentBalance');
        if (data['monthlyInterestRate'] === undefined) throw new Error('Missing required field: monthlyInterestRate');
        break;
      case 'FIXED_TERM_DEPOSIT':
        if (data['initialCapital'] === undefined) throw new Error('Missing required field: initialCapital');
        if (data['maturityDate'] === undefined) throw new Error('Missing required field: maturityDate');
        if (data['annualInterestRate'] === undefined) throw new Error('Missing required field: annualInterestRate');
        if (data['interestPaymentFrequency'] === undefined) throw new Error('Missing required field: interestPaymentFrequency');
        break;
      case 'INVESTMENT_FUND':
        if (data['numberOfUnits'] === undefined) throw new Error('Missing required field: numberOfUnits');
        if (data['netAssetValue'] === undefined) throw new Error('Missing required field: netAssetValue');
        if (data['totalPurchaseValue'] === undefined) throw new Error('Missing required field: totalPurchaseValue');
        if (data['fees'] === undefined) throw new Error('Missing required field: fees');
        break;
      case 'STOCKS':
        if (data['numberOfShares'] === undefined) throw new Error('Missing required field: numberOfShares');
        if (data['unitPurchasePrice'] === undefined) throw new Error('Missing required field: unitPurchasePrice');
        if (data['currentMarketPrice'] === undefined) throw new Error('Missing required field: currentMarketPrice');
        if (data['fees'] === undefined) throw new Error('Missing required field: fees');
        break;
    }
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