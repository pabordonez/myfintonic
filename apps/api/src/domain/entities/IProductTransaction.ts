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