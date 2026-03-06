export interface IProductTransaction {
  id?: string
  productId: string
  description: string
  date: Date
  amount: number
}

export interface IProductTransactionDetail {
  id: string
  description: string
  date: Date
  amount: number
}

export class ProductTransaction implements IProductTransaction {
  public id: string
  public productId: string
  public description: string
  public date: Date
  public amount: number

  private constructor(data: IProductTransaction) {
    this.id = data.id!
    this.productId = data.productId
    this.description = data.description
    this.date = data.date
    this.amount = data.amount
  }

  public static create(
    data: Omit<IProductTransaction, 'id'>,
    id: string
  ): ProductTransaction {
    if (!data.productId) throw new Error('Product ID is required')
    if (!data.description) throw new Error('Description is required')
    if (data.amount === 0) throw new Error('Amount cannot be zero')
    if (!data.date) throw new Error('Date is required')

    return new ProductTransaction({
      ...data,
      id,
    })
  }

  public static fromPrimitives(data: any): ProductTransaction {
    return new ProductTransaction(data)
  }
}
