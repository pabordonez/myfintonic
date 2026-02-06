import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { API_URL } from '@/config/api'
import { useAuth } from '@/hooks/useAuth'
import { ValueHistoryList } from '../../financial-entities/components/ValueHistoryList'

export const ClientFinancialEntityFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const isEditMode = !!id
  
  const [entities, setEntities] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [valueHistory, setValueHistory] = useState<any[]>([])
  const [initialBalance, setInitialBalance] = useState<number | undefined>(undefined)
  const [refreshKey, setRefreshKey] = useState(0)

  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    const loadData = async () => {
      if (!user) return
      setLoading(true)
      try {
        // Cargar catálogo
        const entitiesRes = await axios.get(`${API_URL}/financial-entities`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        setEntities(entitiesRes.data)

        if (isEditMode) {
          const assocRes = await axios.get(`${API_URL}/clients/${user.id}/financial-entities/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const assoc = assocRes.data
          
          reset({
            financialEntityId: assoc.financialEntityId,
            balance: assoc.balance
          })
          
          if (assoc.valueHistory) setValueHistory(assoc.valueHistory)
          if (assoc.initialBalance != null) setInitialBalance(assoc.initialBalance)
        }
      } catch (err) {
        console.error(err)
        setError('Error al cargar datos')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, isEditMode, user, token, reset, refreshKey])

  const onSubmit = async (data: any) => {
    if (!user) return
    setError(null)
    setSuccess(null)
    
    try {
      const payload = {
        ...data,
        balance: Number(data.balance)
      }

      if (isEditMode) {
        await axios.put(`${API_URL}/clients/${user.id}/financial-entities/${id}`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        })
        setSuccess('Entidad actualizada correctamente')
      } else {
        await axios.post(`${API_URL}/clients/${user.id}/financial-entities`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        })
        setSuccess('Entidad creada correctamente')
        reset()
      }
      setRefreshKey(prev => prev + 1)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.error || 'Error al guardar')
    }
  }

  if (loading && !entities.length) return <div>Cargando...</div>

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? 'Editar Entidad' : 'Vincular Entidad'}
      </h1>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-500 mb-4">{success}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="financialEntityId" className="block text-sm font-medium">
            Entidad Financiera
          </label>
          <select
            id="financialEntityId"
            {...register('financialEntityId')}
            disabled={isEditMode}
            className="mt-1 block w-full border rounded p-2 bg-white disabled:bg-gray-100"
          >
            <option value="">Seleccione entidad</option>
            {entities.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
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
        </div>

        <div className="pt-4 flex justify-between">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Volver
          </button>
        </div>
      </form>

      {isEditMode && valueHistory.length > 0 && (
        <div className="mt-8">
          <ValueHistoryList history={valueHistory} initialBalance={initialBalance} />
        </div>
      )}
    </div>
  )
}