import { api } from '../../../config/api'
import {
  CreateTransactionPayload,
  ProductWithTransactions,
} from '../types/transaction.types'

export const transactionService = {
  getProductDetails: async (id: string): Promise<ProductWithTransactions> => {
    const response = await api.get<ProductWithTransactions>(`/products/${id}`)
    return response.data
  },

  createTransaction: async (
    productId: string,
    payload: CreateTransactionPayload
  ): Promise<void> => {
    await api.post(`/products/${productId}/transactions`, payload)
  },
}
