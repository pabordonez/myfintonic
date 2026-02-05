import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  updateClientProfile,
  UpdateClientData,
} from '../services/client.service'
import { Save, ArrowLeft } from 'lucide-react'

export const EditProfilePage = () => {
  const { user, token, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateClientData>()

  // Redirigir si no hay usuario o token
  useEffect(() => {
    if (!user && !token) {
      navigate('/auth/login')
    }
  }, [user, token, navigate])

  // Cargar datos iniciales
  useEffect(() => {
    if (user) {
      setValue('firstName', user.firstName)
      setValue('lastName', user.lastName)
      setValue('nickname', user.nickname || '')
    }
  }, [user, setValue])

  const onSubmit = async (data: UpdateClientData) => {
    if (!user || !token) return

    setIsLoading(true)
    setMessage(null)

    try {
      const updatedUser = await updateClientProfile(user.id, data, token)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      if (refreshUser) await refreshUser() // Actualizar contexto

      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' })

      // Redirigir tras breve pausa
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    } catch {
      setMessage({
        type: 'error',
        text: 'No se pudo actualizar el perfil. Inténtalo de nuevo.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-gray-900">Editar Perfil</h2>
        </div>

        <div className="p-6">
          {message && (
            <div
              className={`mb-4 p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                {...register('firstName', {
                  required: 'El nombre es obligatorio',
                })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Apellidos
              </label>
              <input
                type="text"
                {...register('lastName', {
                  required: 'Los apellidos son obligatorios',
                })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nickname{' '}
                <span className="text-gray-400 font-normal">(Opcional)</span>
              </label>
              <input
                type="text"
                {...register('nickname')}
                placeholder="Cómo quieres que te llamemos"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Este nombre será visible en la barra superior.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                'Guardando...'
              ) : (
                <>
                  <Save size={18} /> Guardar Cambios
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
