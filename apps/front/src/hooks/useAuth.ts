import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

export interface User {
  id: string
  firstName: string
  lastName: string
  nickname?: string | null
  email: string
  role: string
}

// Esquema de validación para asegurar la integridad de los datos locales
const UserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  nickname: z.string().optional().nullable(),
  email: z.string().email(),
  role: z.string(),
})

export const useAuth = () => {
  const navigate = useNavigate()

  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user')
    if (!stored) return null

    try {
      // Validamos que los datos no hayan sido manipulados
      return UserSchema.parse(JSON.parse(stored))
    } catch {
      localStorage.removeItem('user') // Datos corruptos, limpiar
      return null
    }
  })

  const logout = useCallback(() => {
    localStorage.clear()
    setUser(null)
    navigate('/auth/login')
  }, [navigate])

  const refreshUser = useCallback(async () => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        setUser(UserSchema.parse(JSON.parse(stored)))
      } catch {
        logout()
      }
    }
  }, [])

  // OWASP: Sincronización de logout entre pestañas
  // Si el usuario cierra sesión en otra pestaña, limpiamos el estado aquí inmediatamente
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'user' && event.newValue === null) {
        setUser(null)
        navigate('/auth/login')
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [navigate])

  return { user, logout, refreshUser }
}
