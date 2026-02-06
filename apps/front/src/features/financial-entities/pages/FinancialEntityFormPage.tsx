import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { API_URL } from '@/config/api'
import { useAuth } from '@/hooks/useAuth'
import { ArrowLeft, Save } from 'lucide-react'

export const FinancialEntityFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const { register, handleSubmit, reset, setValue } = useForm<{ name: string }>()

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/dashboard')
    }
  }, [user, navigate])

  useEffect(() => {
    if (id && token) {
      const fetchEntity = async () => {
        try {
          const response = await axios.get(`${API_URL}/financial-entities/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          setValue('name', response.data.name)
        } catch (err) {
          console.error(err)
          setError('Error al cargar la entidad')
        }
      }
      fetchEntity()
    }
  }, [id, token, setValue])

  const onSubmit = async (data: { name: string }) => {
    setError(null)
    setSuccess(null)

    try {
      if (id) {
        await axios.put(`${API_URL}/financial-entities/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setSuccess('Entidad actualizada correctamente')
      } else {
        await axios.post(`${API_URL}/financial-entities`, data, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setSuccess('Entidad creada correctamente')
        reset()
      }
    } catch (err) {
      console.error(err)
      setError(id ? 'Error al actualizar la entidad' : 'Error al crear la entidad')
    }
  }

  if (!user || user.role !== 'ADMIN') return null

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? 'Editar Entidad Financiera' : 'Nueva Entidad Financiera'}
        </h1>
        <button
          onClick={() => navigate('/dashboard')}
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

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            id="name"
            type="text"
            {...register('name', { required: true })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: Banco Santander"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full flex justify-center items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            <Save className="h-5 w-5 mr-2" />
            Guardar
          </button>
        </div>
      </form>
    </div>
  )
}