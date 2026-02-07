import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { changePassword } from '../../profile/services/client.service'
import { ArrowLeft, Save } from 'lucide-react'

export const ChangePasswordPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { register, handleSubmit, reset } = useForm()

  const onSubmit = async (data: any) => {
    setError(null)
    setSuccess(null)
    try {
      if (id) {
        await changePassword(id, data)
        setSuccess('Contraseña actualizada correctamente')
        reset()
        setTimeout(() => navigate('/dashboard'), 1500)
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Error al cambiar la contraseña')
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cambiar Contraseña</h1>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Volver
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña Actual
          </label>
          <input
            type="password"
            {...register('currentPassword', { required: true })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nueva Contraseña
          </label>
          <input
            type="password"
            {...register('newPassword', { required: true })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          className="w-full flex justify-center items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Save className="h-5 w-5 mr-2" />
          Actualizar Contraseña
        </button>
      </form>
    </div>
  )
}
