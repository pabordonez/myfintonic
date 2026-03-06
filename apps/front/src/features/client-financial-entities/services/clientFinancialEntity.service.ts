import { api } from '../../../config/api'

export const clientFinancialEntityService = {
  getByClientId: async (clientId: string) => {
    const response = await api.get(`/clients/${clientId}/financial-entities`)
    return response.data
  },

  getById: async (clientId: string, id: string) => {
    const response = await api.get(
      `/clients/${clientId}/financial-entities/${id}`
    )
    return response.data
  },

  create: async (clientId: string, data: any) => {
    const response = await api.post(
      `/clients/${clientId}/financial-entities`,
      data
    )
    return response.data
  },

  update: async (clientId: string, id: string, data: any) => {
    await api.put(`/clients/${clientId}/financial-entities/${id}`, data)
  },

  delete: async (clientId: string, id: string) => {
    await api.delete(`/clients/${clientId}/financial-entities/${id}`)
  },

  getAllAssociations: async () => {
    const response = await api.get('/clients-financial-entities')
    return response.data
  },
}
