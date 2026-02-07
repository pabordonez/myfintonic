import axios from 'axios'
import { API_URL } from '../../../config/api'

// Configuración base para enviar cookies
const axiosConfig = { withCredentials: true }

export const productService = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/products`, axiosConfig)
    return response.data
  },
  getById: async (id: string) => {
    const response = await axios.get(`${API_URL}/products/${id}`, axiosConfig)
    return response.data
  },
  create: async (data: any) => {
    const response = await axios.post(`${API_URL}/products`, data, axiosConfig)
    return response.data
  },
  update: async (id: string, data: any) => {
    const response = await axios.put(
      `${API_URL}/products/${id}`,
      data,
      axiosConfig
    )
    return response.data
  },
  delete: async (id: string) => {
    const response = await axios.delete(
      `${API_URL}/products/${id}`,
      axiosConfig
    )
    return response.data
  },
  patch: async (id: string, data: any) => {
    const response = await axios.patch(
      `${API_URL}/products/${id}`,
      data,
      axiosConfig
    )
    return response.data
  },
}
