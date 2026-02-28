export interface IClientFinancialEntityValueHistory {
  id?: number
  date: Date
  value: number
  previousValue?: number
  clientFinancialEntityId: string
}

export class ClientFinancialEntityValueHistory implements IClientFinancialEntityValueHistory {
  public id?: number
  public date: Date
  public value: number
  public previousValue?: number
  public clientFinancialEntityId: string

  private constructor(data: IClientFinancialEntityValueHistory) {
    this.id = data.id
    this.date = data.date
    this.value = data.value
    this.previousValue = data.previousValue
    this.clientFinancialEntityId = data.clientFinancialEntityId
  }

  public static create(
    data: Omit<IClientFinancialEntityValueHistory, 'id'>
  ): ClientFinancialEntityValueHistory {
    if (!data.date) throw new Error('Date is required')
    if (data.value === undefined) throw new Error('Value is required')
    if (!data.clientFinancialEntityId)
      throw new Error('Client Financial Entity ID is required')

    return new ClientFinancialEntityValueHistory(data)
  }

  public static fromPrimitives(data: any): ClientFinancialEntityValueHistory {
    return new ClientFinancialEntityValueHistory(data)
  }
}
