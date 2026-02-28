import { api } from '../../../config/api'
export interface UpdateClientData {
  firstName: string
  lastName: string
  nickname?: string
}

export const updateClientProfile = async (
  id: string,
  data: UpdateClientData
) => {
  const response = await api.put(`/clients/${id}`, data)
  return response.data
}

export const getClients = async () => {
  const response = await api.get('/clients')
  return response.data
}

export const getClientById = async (id: string) => {
  const response = await api.get(`/clients/${id}`)
  return response.data
}

export const changePassword = async (id: string, data: any) => {
  try {
    await api.put(`/clients/${id}/change-password`, data)
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || 'Error al cambiar la contraseña'
    )
  }
}
