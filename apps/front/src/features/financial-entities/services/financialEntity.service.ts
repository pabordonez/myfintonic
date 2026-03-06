import { api } from '../../../config/api'

export const financialEntityService = {
  getAll: async () => {
    const response = await api.get('/financial-entities')
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/financial-entities/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/financial-entities', data)
    return response.data
  },

  update: async (id: string, data: any) => {
    await api.put(`/financial-entities/${id}`, data)
  },

  delete: async (id: string) => {
    await api.delete(`/financial-entities/${id}`)
  },
}
