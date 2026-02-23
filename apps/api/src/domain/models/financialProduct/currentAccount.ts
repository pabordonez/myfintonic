import { FinancialProduct } from '@domain/models/financialProduct'

export class CurrentAccount extends FinancialProduct {
  public currentBalance!: number
  public transactions!: any[]

  private constructor(data: any) {
    super(data)
    this.currentBalance = data.currentBalance
    this.transactions = data.transactions || []
  }

  public static create(data: any): CurrentAccount {
    if (data.type !== 'CURRENT_ACCOUNT') throw new Error('Invalid product type')
    if (data.currentBalance === undefined)
      throw new Error('Missing required field: currentBalance')
    return new CurrentAccount(data)
  }

  protected createCopy(data: any): FinancialProduct {
    return CurrentAccount.create(data)
  }

  getAllowedUpdateFields(): string[] {
    return [...this.getCommonUpdateFields(), 'currentBalance', 'transactions']
  }

  public validateTransaction(): void {
    if (this.status !== 'ACTIVE') {
      throw new Error('Transaction failed: Product is not active')
    }
  }
}
