import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { API_URL } from '../../../config/api'
import { ValueHistoryList, ValueHistory } from '../../financial-entities/components/ValueHistoryList'

const schema = z.object({
  financialEntityId: z.string().min(1, 'La entidad es requerida'),
  balance: z.coerce.number(),
})

type FormValues = z.infer<typeof schema>

export const ClientFinancialEntityFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!id
  const [entities, setEntities] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [valueHistory, setValueHistory] = useState<ValueHistory[]>([])
  const [initialBalance, setInitialBalance] = useState<number | undefined>(undefined)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('Token not found')
        const userStr = localStorage.getItem('user')
        if (!userStr) throw new Error('User not found')
        const userId = JSON.parse(userStr).id

        // Load catalog
        const catalogRes = await axios.get(`${API_URL}/financial-entities`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setEntities(catalogRes.data)

        if (isEditMode) {
          const assocRes = await axios.get(
            `${API_URL}/clients/${userId}/financial-entities/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
          setValue('financialEntityId', assocRes.data.financialEntityId)
          setValue('balance', assocRes.data.balance)
          if (assocRes.data.valueHistory) {
            setValueHistory(assocRes.data.valueHistory)
          }
          if (assocRes.data.initialBalance !== undefined) {
            setInitialBalance(assocRes.data.initialBalance)
          }
        }
      } catch (err) {
        console.error(err)
        setError('Error al cargar datos')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, isEditMode, setValue])

  const onSubmit = async (data: FormValues) => {
    try {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      const userId = userStr ? JSON.parse(userStr).id : null

      if (isEditMode) {
        await axios.put(
          `${API_URL}/clients/${userId}/financial-entities/${id}`,
          {
            balance: data.balance,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      } else {
        await axios.post(
          `${API_URL}/clients/${userId}/financial-entities`,
          data,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      }
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError('Error al guardar')
      }
    }
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-6">
          {isEditMode ? 'Editar Vinculación' : 'Vincular Entidad'}
        </h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="financialEntityId"
              className="block text-sm font-medium"
            >
              Entidad Financiera
            </label>
            <select
              id="financialEntityId"
              {...register('financialEntityId')}
              disabled={isEditMode}
              className="mt-1 block w-full border rounded p-2 bg-white disabled:bg-gray-100"
            >
              <option value="">Seleccione entidad</option>
              {entities.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
            {errors.financialEntityId && (
              <p className="text-red-500 text-xs">
                {errors.financialEntityId.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="balance" className="block text-sm font-medium">
              Balance
            </label>
            <input
              id="balance"
              type="number"
              step="0.01"
              {...register('balance')}
              className="mt-1 block w-full border rounded p-2"
            />
            {errors.balance && (
              <p className="text-red-500 text-xs">{errors.balance.message}</p>
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

      {isEditMode && valueHistory.length > 0 && (
        <ValueHistoryList history={valueHistory} initialBalance={initialBalance} />
      )}
    </div>
  )
}