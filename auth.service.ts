import { API_URL } from '../../../config/api'

export const authService = {
  login: async (data: any) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const json = await response.json().catch(() => ({}))
      throw new Error(json.error || 'Credenciales inválidas')
    }
    return response.json()
  },

  logout: async () => {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al cerrar sesión')
    return response.json()
  },
}