import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { updateClientProfile } from '../services/client.service'
import { ArrowLeft, Save, Key } from 'lucide-react'

export const EditProfilePage = () => {
  const navigate = useNavigate()
  const { user, token, refreshUser } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { register, handleSubmit, setValue } = useForm()

  useEffect(() => {
    if (!user) {
      navigate('/auth/login')
      return
    }
    setValue('firstName', user.firstName)
    setValue('lastName', user.lastName)
    setValue('email', user.email)
    setValue('nickname', user.nickname)
  }, [user, navigate, setValue])

  const onSubmit = async (data: any) => {
    if (!user || !token) return
    setError(null)
    setSuccess(null)

    try {
      await updateClientProfile(user.id, data, token)
      await refreshUser()
      setSuccess('Perfil actualizado correctamente')
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    } catch (err) {
      console.error(err)
      setError('No se pudo actualizar el perfil. Inténtalo de nuevo.')
    }
  }

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Editar Perfil</h1>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Volver
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4 border border-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4 border border-green-200">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre
            </label>
            <input
              id="firstName"
              {...register('firstName', { required: true })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Apellido
            </label>
            <input
              id="lastName"
              {...register('lastName', { required: true })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="nickname"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Apodo (Opcional)
          </label>
          <input
            id="nickname"
            {...register('nickname')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email', { required: true })}
            disabled
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div className="pt-2">
          <Link
            to={`/clients/${user.id}/change-password`}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
          >
            <Key className="h-4 w-4 mr-1" />
            Cambiar Contraseña
          </Link>
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
