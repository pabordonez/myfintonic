import axios from 'axios'
import { API_URL } from '../../../config/api'

const axiosConfig = { withCredentials: true }

export const clientFinancialEntityService = {
  getByClientId: async (clientId: string) => {
    const response = await axios.get(
      `${API_URL}/clients/${clientId}/financial-entities`,
      axiosConfig
    )
    return response.data
  },

  getById: async (clientId: string, id: string) => {
    const response = await axios.get(
      `${API_URL}/clients/${clientId}/financial-entities/${id}`,
      axiosConfig
    )
    return response.data
  },

  create: async (clientId: string, data: any) => {
    const response = await axios.post(
      `${API_URL}/clients/${clientId}/financial-entities`,
      data,
      axiosConfig
    )
    return response.data
  },

  update: async (clientId: string, id: string, data: any) => {
    await axios.put(
      `${API_URL}/clients/${clientId}/financial-entities/${id}`,
      data,
      axiosConfig
    )
  },

  delete: async (clientId: string, id: string) => {
    await axios.delete(
      `${API_URL}/clients/${clientId}/financial-entities/${id}`,
      axiosConfig
    )
  },

  getAllAssociations: async () => {
    const response = await axios.get(
      `${API_URL}/clients-financial-entities`,
      axiosConfig
    )
    return response.data
  },
}
