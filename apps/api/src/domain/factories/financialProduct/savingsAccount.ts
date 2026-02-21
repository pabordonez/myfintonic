import { FinancialProduct } from '@domain/factories/financialProduct/financialProduct'

export class SavingsAccount extends FinancialProduct {
  public currentBalance!: number
  public monthlyInterestRate!: number
  public transactions!: any[]

  private constructor(data: any) {
    super(data)
    this.currentBalance = data.currentBalance
    this.monthlyInterestRate = data.monthlyInterestRate
    this.transactions = data.transactions || []
  }

  public static create(data: any): SavingsAccount {
    if (data.type !== 'SAVINGS_ACCOUNT') throw new Error('Invalid product type')
    if (data.currentBalance === undefined)
      throw new Error('Missing required field: currentBalance')
    if (data.monthlyInterestRate === undefined)
      throw new Error('Missing required field: monthlyInterestRate')
    return new SavingsAccount(data)
  }

  protected createCopy(data: any): FinancialProduct {
    return SavingsAccount.create(data)
  }

  getAllowedUpdateFields(): string[] {
    return [
      ...this.getCommonUpdateFields(),
      'currentBalance',
      'monthlyInterestRate',
      'transactions',
    ]
  }
}
