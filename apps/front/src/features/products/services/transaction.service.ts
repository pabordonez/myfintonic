import axios from 'axios'
import {
  CreateTransactionPayload,
  ProductWithTransactions,
} from '../types/transaction.types'
import { API_URL } from '../../../config/api'

const axiosConfig = { withCredentials: true }

export const transactionService = {
  getProductDetails: async (id: string): Promise<ProductWithTransactions> => {
    const response = await axios.get<ProductWithTransactions>(
      `${API_URL}/products/${id}`,
      axiosConfig
    )
    return response.data
  },

  createTransaction: async (
    productId: string,
    payload: CreateTransactionPayload
  ): Promise<void> => {
    await axios.post(
      `${API_URL}/products/${productId}/transactions`,
      payload,
      axiosConfig
    )
  },
}
