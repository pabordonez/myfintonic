import { useEffect, useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { Briefcase, Trash2 } from 'lucide-react'
import { productService } from '../services/product.service'
import { ProfitabilityBadge } from '../../financial-entities/components/ProfitabilityBadge'

const productTypes: Record<string, string> = {
  CURRENT_ACCOUNT: 'Cuenta Corriente',
  SAVINGS_ACCOUNT: 'Cuenta Ahorro',
  FIXED_TERM_DEPOSIT: 'Depósito Plazo Fijo',
  INVESTMENT_FUND: 'Fondo Inversión',
  STOCKS: 'Acciones',
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800'
    case 'PAUSED':
      return 'bg-yellow-100 text-yellow-800'
    case 'EXPIRED':
      return 'bg-red-100 text-red-800'
    case 'INACTIVE':
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

type SortDirection = 'asc' | 'desc' | null

interface SortConfig {
  key: string | null
  direction: SortDirection
}

export const ProductsPage = () => {
  const navigate = useNavigate()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const token = localStorage.getItem('token')

  // Estados de Filtros y Ordenación
  const [filterName, setFilterName] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterEntities, setFilterEntities] = useState<string[]>([])
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null })

  useEffect(() => {
    if (!token) {
      navigate('/auth/login')
      return
    }

    fetchData()
  }, [navigate, token])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await productService.getAll()
      setData(data)
    } catch (err) {
      console.error(err)
      setError('Error al cargar los productos.')
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.clear()
        navigate('/auth/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return
    try {
      await productService.delete(id)
      fetchData()
    } catch (err) {
      console.error(err)
      setError('Error al eliminar el producto.')
    }
  }

  // --- Lógica de Filtrado y Ordenación (Memoizada) ---

  // 1. Obtener lista única de entidades para el filtro
  const uniqueEntities = useMemo(() => {
    const names = new Set(data.map((d) => d.financialEntityName).filter(Boolean))
    return Array.from(names).sort()
  }, [data])

  // 2. Procesar datos (Filtrar + Ordenar)
  const processedData = useMemo(() => {
    let result = [...data]

    // Filtros
    if (filterName) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(filterName.toLowerCase())
      )
    }
    if (filterType) {
      result = result.filter((item) => item.type === filterType)
    }
    if (filterStatus) {
      result = result.filter((item) => item.status === filterStatus)
    }
    if (filterEntities.length > 0) {
      result = result.filter((item) =>
        filterEntities.includes(item.financialEntityName)
      )
    }

    // Ordenación
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        let valA, valB

        if (sortConfig.key === 'differential') {
          valA = (Number(a.currentBalance ?? a.initialBalance) || 0) - (Number(a.initialBalance) || 0)
          valB = (Number(b.currentBalance ?? b.initialBalance) || 0) - (Number(b.initialBalance) || 0)
        } else if (sortConfig.key === 'balance') {
          valA = a.currentBalance ?? a.initialBalance ?? 0
          valB = b.currentBalance ?? b.initialBalance ?? 0
        } else {
          valA = a[sortConfig.key!]?.toString().toLowerCase() ?? ''
          valB = b[sortConfig.key!]?.toString().toLowerCase() ?? ''
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [data, filterName, filterType, filterStatus, filterEntities, sortConfig])

  // Handlers
  const handleSort = (key: string) => {
    let direction: SortDirection = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null
    }
    setSortConfig({ key: direction ? key : null, direction })
  }

  const clearFilters = () => {
    setFilterName('')
    setFilterType('')
    setFilterStatus('')
    setFilterEntities([])
    setSortConfig({ key: null, direction: null })
  }

  const renderSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <span className="text-gray-300 ml-1 text-xs">↕</span>
    return (
      <span className="text-blue-600 ml-1 text-xs">
        {sortConfig.direction === 'asc' ? '▲' : '▼'}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg font-medium text-gray-500">
          Cargando productos...
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Briefcase className="h-8 w-8 text-indigo-600" />
          Productos Financieros
        </h1>
        <Link
          to="/products/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Nuevo Producto
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* --- Barra de Filtros --- */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* Búsqueda por Nombre */}
          <div>
            <label htmlFor="filter-name" className="block text-xs font-semibold text-gray-500 uppercase mb-1">Buscar</label>
            <input
              id="filter-name"
              type="text"
              placeholder="Nombre..."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
          </div>

          {/* Filtro Entidad (Múltiple) */}
          <div>
            <label htmlFor="filter-entities" className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Entidad (Ctrl+Click)
            </label>
            <select
              id="filter-entities"
              multiple
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-[42px]"
              value={filterEntities}
              onChange={(e) =>
                setFilterEntities(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
            >
              {uniqueEntities.map((entity) => (
                <option key={entity} value={entity}>
                  {entity}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Tipo */}
          <div>
            <label htmlFor="filter-type" className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tipo</label>
            <select
              id="filter-type"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white h-[42px]"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">Todos</option>
              {Object.entries(productTypes).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Estado */}
          <div>
            <label htmlFor="filter-status" className="block text-xs font-semibold text-gray-500 uppercase mb-1">Estado</label>
            <select
              id="filter-status"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white h-[42px]"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
              <option value="PAUSED">Pausado</option>
              <option value="EXPIRED">Expirado</option>
            </select>
          </div>

          {/* Botón Limpiar */}
          <button
            onClick={clearFilters}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-2 px-4 rounded border border-gray-300 transition-colors text-sm h-[42px]"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {processedData.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No se encontraron productos con los filtros actuales.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">Nombre {renderSortIcon('name')}</div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('financialEntityName')}
                  >
                    <div className="flex items-center">Entidad {renderSortIcon('financialEntityName')}</div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center">Tipo {renderSortIcon('type')}</div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('differential')}
                  >
                    <div className="flex items-center">Diferencial {renderSortIcon('differential')}</div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('balance')}
                  >
                    <div className="flex items-center">Balance {renderSortIcon('balance')}</div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">Estado {renderSortIcon('status')}</div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('updatedAt')}
                  >
                    <div className="flex items-center">Actualizado {renderSortIcon('updatedAt')}</div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processedData.map((item: any) => (
                  <tr key={item.id}>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                      onClick={() => navigate(`/products/${item.id}`)}
                    >
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.financialEntityName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {productTypes[item.type] || item.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.initialBalance != null && Number(item.initialBalance) !== 0 ? (
                        <ProfitabilityBadge
                          currentValue={item.currentBalance ?? item.initialBalance ?? 0}
                          initialValue={item.initialBalance}
                        />
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Intl.NumberFormat('es-ES', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(
                        item.currentBalance ?? item.initialBalance ?? 0
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Eliminar producto"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
