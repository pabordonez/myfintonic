import { useEffect, useState, useMemo } from 'react'
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Building2, Plus } from 'lucide-react'
import axios from 'axios'
import { API_URL } from '@/config/api'
import { useAuth } from '@/hooks/useAuth'
import { Link, useNavigate } from 'react-router-dom'

export const FinancialEntitiesPage = () => {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [entities, setEntities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Estados para filtrado y ordenación
  const [searchTerm, setSearchTerm] = useState('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null)

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_URL}/financial-entities`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setEntities(response.data)
      } catch (err) {
        console.error(err)
        setError('Error al cargar el catálogo de entidades')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchEntities()
    }
  }, [token])

  // Lógica de filtrado y ordenación (Client-side)
  const processedEntities = useMemo(() => {
    return [...(entities || [])]
      .filter((entity) =>
        (entity?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (!sortDirection) return 0
        const comparison = (a?.name || '').localeCompare(b?.name || '')
        return sortDirection === 'asc' ? comparison : -comparison
      })
  }, [entities, searchTerm, sortDirection])

  const handleSort = () => {
    setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
  }

  const SortIcon = () => {
    if (!sortDirection) return <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-1 h-4 w-4 text-indigo-600" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4 text-indigo-600" />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="h-8 w-8 text-indigo-600" />
          Catálogo de Entidades
        </h1>
        {user?.role === 'ADMIN' && (
          <Link
            to="/financial-entities/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nueva Entidad
          </Link>
        )}
      </div>

      {/* Barra de Búsqueda */}
      <div className="relative max-w-xs w-full">
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

      {/* Tabla de Resultados */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando catálogo...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="w-full px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={handleSort}
                >
                  <div className="flex items-center">
                    Nombre
                    <SortIcon />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actualizado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processedEntities.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchTerm ? 'No se encontraron entidades con ese nombre.' : 'No hay entidades disponibles.'}
                  </td>
                </tr>
              ) : (
                processedEntities.map((entity) => (
                  <tr
                    key={entity.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/financial-entities/${entity.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entity.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {entity.updatedAt ? new Date(entity.updatedAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
