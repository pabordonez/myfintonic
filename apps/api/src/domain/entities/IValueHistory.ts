export interface IValueHistory {
  id: number
  date: Date
  value: number
  previousValue?: number
  financialEntityId?: string
}
