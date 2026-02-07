import axios from 'axios'
import { API_URL } from '../../../config/api'

const axiosConfig = { withCredentials: true }

export const financialEntityService = {
  getAll: async () => {
    const response = await axios.get(
      `${API_URL}/financial-entities`,
      axiosConfig
    )
    return response.data
  },

  getById: async (id: string) => {
    const response = await axios.get(
      `${API_URL}/financial-entities/${id}`,
      axiosConfig
    )
    return response.data
  },

  create: async (data: any) => {
    const response = await axios.post(
      `${API_URL}/financial-entities`,
      data,
      axiosConfig
    )
    return response.data
  },

  update: async (id: string, data: any) => {
    await axios.put(`${API_URL}/financial-entities/${id}`, data, axiosConfig)
  },

  delete: async (id: string) => {
    await axios.delete(`${API_URL}/financial-entities/${id}`, axiosConfig)
  },
}
