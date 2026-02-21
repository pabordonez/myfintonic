import { FinancialProduct } from '@domain/models/financialProduct'

export class InvestmentFund extends FinancialProduct {
  public currentBalance!: number
  public numberOfUnits?: number
  public netAssetValue?: number
  public fees?: { opening: number; closing: number; maintenance: number }

  private constructor(data: any) {
    super(data)
    this.currentBalance = data.currentBalance
    this.numberOfUnits = data.numberOfUnits
    this.netAssetValue = data.netAssetValue
    this.fees = data.fees
  }

  public static create(data: any): InvestmentFund {
    if (data.type !== 'INVESTMENT_FUND') throw new Error('Invalid product type')
    if (data.currentBalance === undefined)
      throw new Error('Missing required field: currentBalance')
    return new InvestmentFund(data)
  }

  protected createCopy(data: any): FinancialProduct {
    return InvestmentFund.create(data)
  }

  getAllowedUpdateFields(): string[] {
    return [
      ...this.getCommonUpdateFields(),
      'currentBalance',
      'numberOfUnits',
      'netAssetValue',
      'fees',
    ]
  }
}
