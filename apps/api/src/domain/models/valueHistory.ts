export interface IValueHistory {
  id?: number
  date: Date
  value: number
  previousValue?: number
  productId?: string
}

export class ValueHistory implements IValueHistory {
  public id?: number
  public date: Date
  public value: number
  public previousValue?: number
  public productId?: string

  private constructor(data: IValueHistory) {
    this.id = data.id
    this.date = data.date
    this.value = data.value
    this.previousValue = data.previousValue
    this.productId = data.productId
  }

  public static create(data: Omit<IValueHistory, 'id'>): ValueHistory {
    if (!data.date) throw new Error('Date is required')
    if (data.value === undefined) throw new Error('Value is required')

    return new ValueHistory(data)
  }

  public static fromPrimitives(data: any): ValueHistory {
    return new ValueHistory(data)
  }
}
