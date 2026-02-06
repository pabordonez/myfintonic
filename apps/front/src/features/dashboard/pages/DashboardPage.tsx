import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Search, ArrowUpDown, ArrowUp, ArrowDown, Wallet, Users, Key } from 'lucide-react'
import axios from 'axios'
import { API_URL } from '@/config/api'
import { ProfitabilityBadge } from '../../financial-entities/components/ProfitabilityBadge'

export const DashboardPage = () => {
  const { user, token } = useAuth()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [activeTab, setActiveTab] = useState<'clients' | 'entities'>('clients')

  useEffect(() => {
    const fetchData = async () => {
      // Evitar ejecución si no hay usuario (aunque MainLayout ya protege, es doble seguridad)
      if (!user) return

      try {
        setLoading(true)

        let url = ''
        if (user.role === 'ADMIN') {
          if (activeTab === 'clients') {
            url = `${API_URL}/clients`
          } else {
            url = `${API_URL}/clients-financial-entities`
          }
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
  }, [user, token, activeTab])

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

  // Lógica de filtrado y ordenación
  const processedItems = useMemo(() => {
    return [...(items || [])]
      .filter((item) =>
        (item.financialEntity?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (!sortConfig) return 0
        let aValue: any = ''
        let bValue: any = ''

        if (sortConfig.key === 'name') {
          aValue = a.financialEntity?.name || ''
          bValue = b.financialEntity?.name || ''
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }

        if (sortConfig.key === 'differential') {
          aValue = (Number(a.balance) || 0) - (Number(a.initialBalance) || 0)
          bValue = (Number(b.balance) || 0) - (Number(b.initialBalance) || 0)
        } else if (sortConfig.key === 'balance') {
          aValue = Number(a.balance) || 0
          bValue = Number(b.balance) || 0
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
  }, [items, searchTerm, sortConfig])

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
    return sortConfig.direction === 'asc' ? <ArrowUp className="ml-1 h-4 w-4 text-indigo-600" /> : <ArrowDown className="ml-1 h-4 w-4 text-indigo-600" />
  }

  const headerClass = "px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          {user.role === 'ADMIN' ? (
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('clients')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  activeTab === 'clients' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="h-6 w-6" />
                Clientes
              </button>
              <button
                onClick={() => setActiveTab('entities')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  activeTab === 'entities'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Wallet className="h-6 w-6" />
                Clientes-Entidades
              </button>
            </div>
          ) : (
            <>
              <Wallet className="h-8 w-8 text-indigo-600" />
              Mis Entidades Financieras
            </>
          )}
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

      {user.role === 'USER' && (
        <div className="relative max-w-xs w-full mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Buscar entidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">Cargando...</div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-700">{error}</div>
      ) : (
        <>
          {user.role === 'USER' || (user.role === 'ADMIN' && activeTab === 'entities') ? (
            <>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="w-full px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                      <div className="flex items-center">
                        Nombre
                        <SortIcon columnKey="name" />
                      </div>
                    </th>
                    {user.role === 'ADMIN' && (
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Cliente
                      </th>
                    )}
                    <th scope="col" className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('differential')}>
                      <div className="flex items-center">
                        Diferencial
                        <SortIcon columnKey="differential" />
                      </div>
                    </th>
                    <th scope="col" className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('balance')}>
                      <div className="flex items-center">
                        Balance Actual
                        <SortIcon columnKey="balance" />
                      </div>
                    </th>
                    <th scope="col" className="whitespace-nowrap px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Actualizado
                    </th>
                    {user.role !== 'ADMIN' && (
                      <th scope="col" className="whitespace-nowrap px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Acciones
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {processedItems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        {items.length === 0 ? 'No hay elementos para mostrar.' : 'No se encontraron resultados.'}
                      </td>
                    </tr>
                  )}
                  {processedItems.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.role === 'ADMIN' ? (
                          <span className="text-sm font-medium text-gray-900">
                            {item.financialEntity?.name || 'Entidad Desconocida'}
                          </span>
                        ) : (
                          <Link
                            to={`/client-entities/${item.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                          >
                            {item.financialEntity?.name || 'Entidad Desconocida'}
                          </Link>
                        )}
                      </td>
                      {user.role === 'ADMIN' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.client ? `${item.client.firstName} ${item.client.lastName}` : '-'}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.initialBalance != null && Number(item.initialBalance) !== 0 ? (
                          <ProfitabilityBadge
                            currentValue={item.balance}
                            initialValue={item.initialBalance}
                          />
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {new Intl.NumberFormat('es-ES', {
                            style: 'currency',
                            currency: 'EUR',
                          }).format(item.balance)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '-'}
                      </td>
                      {user.role !== 'ADMIN' && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className={`text-left ${headerClass}`}>
                      Nombre
                    </th>
                    <th scope="col" className={`text-left ${headerClass}`}>
                      Rol
                    </th>
                    <th scope="col" className={`text-right ${headerClass}`}>
                      Actualizado
                    </th>
                    <th scope="col" className={`text-right ${headerClass}`}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                        No hay clientes para mostrar.
                      </td>
                    </tr>
                  )}
                  {items.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.firstName} {item.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{item.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {item.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/clients/${item.id}/change-password`}
                          className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                          title="Cambiar Contraseña"
                        >
                          <Key className="h-5 w-5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
