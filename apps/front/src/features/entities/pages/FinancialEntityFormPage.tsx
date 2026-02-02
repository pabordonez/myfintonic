import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { API_URL } from '../../../config/api'

const entitySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
})

type EntityFormValues = z.infer<typeof entitySchema>

export const FinancialEntityFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!id
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const role = localStorage.getItem('role')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EntityFormValues>({
    resolver: zodResolver(entitySchema),
  })

  useEffect(() => {
    if (role !== 'ADMIN') {
      navigate('/financial-entities')
      return
    }

    const loadData = async () => {
      if (!isEditMode) return

      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(
          `${API_URL}/financial-entities/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        setValue('name', response.data.name)
      } catch (err) {
        console.error(err)
        setError('Error al cargar datos')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, isEditMode, setValue, role, navigate])

  const onSubmit = async (data: EntityFormValues) => {
    try {
      const token = localStorage.getItem('token')

      if (isEditMode) {
        await axios.put(`${API_URL}/financial-entities/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } else {
        await axios.post(`${API_URL}/financial-entities`, data, {
          headers: { Authorization: `Bearer ${token}` },
        })
      }
      navigate('/financial-entities')
    } catch (err) {
      console.error(err)
      setError('Error al guardar')
    }
  }

  if (role !== 'ADMIN') return null
  if (loading) return <div>Cargando...</div>

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? 'Editar Entidad' : 'Nueva Entidad'}
      </h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Nombre
          </label>
          <input
            id="name"
            {...register('name')}
            className="mt-1 block w-full border rounded p-2"
          />
          {errors.name && (
            <p className="text-red-500 text-xs">{errors.name.message}</p>
          )}
        </div>
        <div className="pt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  )
}
