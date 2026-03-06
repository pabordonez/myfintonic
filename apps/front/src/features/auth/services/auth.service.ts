import { api } from '../../../config/api'

export const authService = {
  login: async (data: any) => {
    try {
      const response = await api.post('/auth/login', data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Credenciales inválidas')
    }
  },

  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },
}
