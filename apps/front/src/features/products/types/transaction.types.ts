export enum ProductType {
  CURRENT_ACCOUNT = 'CURRENT_ACCOUNT',
  SAVINGS_ACCOUNT = 'SAVINGS_ACCOUNT',
  FIXED_TERM_DEPOSIT = 'FIXED_TERM_DEPOSIT',
  INVESTMENT_FUND = 'INVESTMENT_FUND',
  STOCKS = 'STOCKS',
}

export interface Transaction {
  date: string; // ISO String
  description: string;
  amount: number;
}

export interface CreateTransactionPayload {
  date: string;
  description: string;
  amount: number;
}

export interface ProductWithTransactions {
  id: string;
  name: string;
  type: ProductType | string;
  transactions?: Transaction[];
}