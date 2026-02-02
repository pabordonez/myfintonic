const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface UpdateClientData {
  firstName: string
  lastName: string
  nickname?: string
}

export const updateClientProfile = async (
  id: string,
  data: UpdateClientData,
  token: string
) => {
  const response = await fetch(`${API_URL}/clients/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Error al actualizar el perfil')
  }

  return response.json()
}
