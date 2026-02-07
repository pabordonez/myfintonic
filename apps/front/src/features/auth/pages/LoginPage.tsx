import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { API_URL } from '../../../config/api'

export const LoginPage = () => {
  const { register, handleSubmit } = useForm()
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  const onSubmit = async (data: any) => {
    try {
      // 1. Login para obtener token
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!loginRes.ok) throw new Error('Credenciales inválidas')
      const { token } = await loginRes.json()

      // 2. Decodificar token para obtener ID (payload base64)
      const payload = JSON.parse(atob(token.split('.')[1]))
      const userId = payload.id

      // 3. Obtener datos completos del usuario
      const userRes = await fetch(`${API_URL}/clients/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!userRes.ok) throw new Error('Error al obtener perfil')
      const user = await userRes.json()

      // 4. Guardar sesión
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      await refreshUser()
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            MyFintonic Login
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && <div className="text-red-500 text-center">{error}</div>}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                {...register('email', { required: true })}
                type="email"
                placeholder="Email"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              />
            </div>
            <div>
              <input
                {...register('password', { required: true })}
                type="password"
                placeholder="Contraseña"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Iniciar Sesión
            </button>
          </div>
          <div className="text-center">
            <Link
              to="/auth/register"
              className="text-indigo-600 hover:text-indigo-500"
            >
              ¿No tienes cuenta? Regístrate
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
