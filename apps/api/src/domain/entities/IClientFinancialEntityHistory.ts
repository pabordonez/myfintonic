export interface IClientFinancialEntityValueHistory {
  id?: number
  date: Date
  value: number
  previousValue?: number
  clientFinancialEntityId: string
}
