import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '../services/auth.service'
import { LogOut } from 'lucide-react'

export const LogoutButton = () => {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      // Limpiar estado local independientemente del resultado de la API
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      await refreshUser()
      navigate('/auth/login')
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      title="Cerrar Sesión"
    >
      <LogOut size={20} />
      <span className="hidden md:inline">Salir</span>
    </button>
  )
}
