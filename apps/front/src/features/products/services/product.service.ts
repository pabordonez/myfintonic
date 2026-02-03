import axios from 'axios'
import { API_URL } from '../../../config/api'

const getHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    headers: { Authorization: `Bearer ${token}` },
  }
}

export const productService = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/products`, getHeaders())
    return response.data
  },
  getById: async (id: string) => {
    const response = await axios.get(`${API_URL}/products/${id}`, getHeaders())
    return response.data
  },
  create: async (data: any) => {
    const response = await axios.post(`${API_URL}/products`, data, getHeaders())
    return response.data
  },
  update: async (id: string, data: any) => {
    const response = await axios.put(
      `${API_URL}/products/${id}`,
      data,
      getHeaders()
    )
    return response.data
  },
  delete: async (id: string) => {
    const response = await axios.delete(
      `${API_URL}/products/${id}`,
      getHeaders()
    )
    return response.data
  },
  getFinancialEntities: async () => {
    const response = await axios.get(
      `${API_URL}/financial-entities`,
      getHeaders()
    )
    return response.data
  },
  patch: async (id: string, data: any) => {
    const response = await axios.patch(
      `${API_URL}/products/${id}`,
      data,
      getHeaders()
    )
    return response.data
  },
}
