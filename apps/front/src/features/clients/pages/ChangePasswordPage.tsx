import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { API_URL } from '@/config/api'
import { useAuth } from '@/hooks/useAuth'
import { ArrowLeft, Save } from 'lucide-react'

export const ChangePasswordPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const { register, handleSubmit, reset } = useForm()

  const onSubmit = async (data: any) => {
    setError(null)
    setSuccess(null)

    try {
      const payload: any = {
        newPassword: data.newPassword
      }

      // Solo enviamos currentPassword si el usuario NO es admin
      // (o si es admin cambiando su propia contraseña, pero la regla de negocio dice que admin no la necesita)
      if (user?.role !== 'ADMIN') {
        payload.currentPassword = data.currentPassword
      }

      await axios.put(`${API_URL}/clients/${id}/change-password`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setSuccess('Contraseña actualizada correctamente')
      reset()
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.error || 'Error al cambiar la contraseña')
    }
  }

  if (!user) return null

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded shadow mt-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Cambiar Contraseña
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Volver
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4 border border-red-200">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4 border border-green-200">{success}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {user.role !== 'ADMIN' && (
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña Actual
            </label>
            <input
              id="currentPassword"
              type="password"
              {...register('currentPassword', { required: true })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        )}

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Nueva Contraseña
          </label>
          <input
            id="newPassword"
            type="password"
            {...register('newPassword', { required: true })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full flex justify-center items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            <Save className="h-5 w-5 mr-2" />
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  )
}