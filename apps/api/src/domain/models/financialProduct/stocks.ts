import { FinancialProduct } from '@domain/models/financialProduct'

export class Stocks extends FinancialProduct {
  public numberOfShares!: number
  public unitPurchasePrice!: number
  public currentMarketPrice!: number
  public initialBalance!: number
  public currentBalance!: number

  private constructor(data: any) {
    super(data)
    this.numberOfShares = data.numberOfShares
    this.unitPurchasePrice = data.unitPurchasePrice
    this.currentMarketPrice = data.currentMarketPrice
    this.initialBalance = data.initialBalance
    this.currentBalance = data.currentBalance
  }

  public static create(data: any): Stocks {
    if (data.type !== 'STOCKS') throw new Error('Invalid product type')
    if (data.numberOfShares === undefined)
      throw new Error('Missing required field: numberOfShares')
    if (data.unitPurchasePrice === undefined)
      throw new Error('Missing required field: unitPurchasePrice')
    if (data.currentMarketPrice === undefined)
      throw new Error('Missing required field: currentMarketPrice')
    if (data.initialBalance === undefined)
      throw new Error('Missing required field: initialBalance')
    return new Stocks(data)
  }

  protected createCopy(data: any): FinancialProduct {
    return Stocks.create(data)
  }

  getAllowedUpdateFields(): string[] {
    return [
      ...this.getCommonUpdateFields(),
      'currentBalance',
      'initialBalance',
      'numberOfShares',
      'unitPurchasePrice',
      'currentMarketPrice',
    ]
  }
}
