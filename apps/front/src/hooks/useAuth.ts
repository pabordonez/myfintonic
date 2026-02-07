import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export interface User {
  id: string
  firstName: string
  lastName: string
  nickname?: string
  email: string
  role: string
}

export const useAuth = () => {
  const navigate = useNavigate()

  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token')
  })

  const logout = useCallback(() => {
    localStorage.clear()
    setToken(null)
    setUser(null)
    navigate('/auth/login')
  }, [navigate])

  const refreshUser = useCallback(async () => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  return { user, token, logout, refreshUser }
}
