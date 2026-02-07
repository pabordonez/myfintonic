import { API_URL } from '../../../config/api'
export interface UpdateClientData {
  firstName: string
  lastName: string
  nickname?: string
}

export const updateClientProfile = async (
  id: string,
  data: UpdateClientData
) => {
  const response = await fetch(`${API_URL}/clients/${id}`, {
    method: 'PUT',
    credentials: 'include', // Enviar cookies
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Error al actualizar el perfil')
  }

  return response.json()
}

export const getClients = async () => {
  const response = await fetch(`${API_URL}/clients`, {
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Error al obtener clientes')
  return response.json()
}
