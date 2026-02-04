import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Link } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import axios from 'axios'
import { API_URL } from '@/config/api'
import { ProfitabilityBadge } from '../../financial-entities/components/ProfitabilityBadge'

export const DashboardPage = () => {
  const { user, token } = useAuth()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      // Evitar ejecución si no hay usuario (aunque MainLayout ya protege, es doble seguridad)
      if (!user) return

      try {
        setLoading(true)

        let url = ''
        if (user.role === 'ADMIN') {
          url = `${API_URL}/clients`
        } else {
          // Verificación explícita para evitar el error "User ID not found"
          if (!user.id) throw new Error('User ID not found')
          url = `${API_URL}/clients/${user.id}/financial-entities`
        }

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        })

        setItems(response.data)
      } catch (err: any) {
        console.error(err)
        setError('Error al cargar los datos')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, token])

  // Calcular el balance total
  const totalBalance = items.reduce((acc, item) => acc + (Number(item.balance) || 0), 0)
  const totalInitialBalance = items.reduce(
    (acc, item) => acc + (Number(item.initialBalance) || 0),
    0
  )

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la entidad ${name}?`)) return

    try {
      await axios.delete(`${API_URL}/clients/${user?.id}/financial-entities/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      console.error(err)
      setError('Error al eliminar la entidad')
    }
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {user.role === 'ADMIN'
            ? 'Gestión de Clientes'
            : 'Mis Entidades Financieras'}
        </h1>
        {user.role === 'USER' && (
          <Link
            to="/client-entities/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nueva Entidad
          </Link>
        )}
      </div>

      {loading ? (
        <div className="text-center py-10">Cargando...</div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-700">{error}</div>
      ) : (
        <>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {items.length === 0 && (
              <li className="px-4 py-4 sm:px-6 text-gray-500 text-center">
                No hay elementos para mostrar.
              </li>
            )}
            {items.map((item: any) => (
              <li key={item.id}>
                <Link
                  to={
                    user.role === 'ADMIN' ? '#' : `/client-entities/${item.id}`
                  }
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {user.role === 'ADMIN'
                          ? `${item.firstName} ${item.lastName} (${item.email})`
                          : item.financialEntity?.name || 'Entidad Desconocida'}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex items-center gap-4">
                        <p className="text-sm text-gray-500">
                          {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '-'}
                        </p>
                        {user.role === 'USER' && item.initialBalance != null && Number(item.initialBalance) !== 0 && (
                          <ProfitabilityBadge
                            currentValue={item.balance}
                            initialValue={item.initialBalance}
                          />
                        )}
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {user.role === 'ADMIN'
                            ? item.role
                            : new Intl.NumberFormat('es-ES', {
                                style: 'currency',
                                currency: 'EUR',
                              }).format(item.balance)}
                        </p>
                        {user.role === 'USER' && (
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              handleDelete(item.id, item.financialEntity?.name)
                            }}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Eliminar entidad"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          </div>
          {user.role === 'USER' && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-right">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Balance Total
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-indigo-600 flex justify-end items-center gap-3">
                  {totalInitialBalance > 0 && (
                    <ProfitabilityBadge
                      currentValue={totalBalance}
                      initialValue={totalInitialBalance}
                      className="px-3 py-1 text-sm font-bold"
                      iconSize={4}
                    />
                  )}
                  {new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(totalBalance)}
                </dd>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
