import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Building2, Trash2, Plus } from 'lucide-react'
import { API_URL } from '@/config/api'
import { useAuth } from '@/hooks/useAuth'

export const FinancialEntitiesPage = () => {
  const { user, token } = useAuth()
  const [entities, setEntities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEntities()
  }, [token])

  const fetchEntities = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/financial-entities`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEntities(response.data)
    } catch (err) {
      console.error(err)
      setError('Error al cargar las entidades')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar la entidad ${name}?`)) return

    try {
      await axios.delete(`${API_URL}/financial-entities/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEntities(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      console.error(err)
      setError('Error al eliminar la entidad')
    }
  }

  const headerClass = "px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"

  if (loading) return <div className="p-6 text-center">Cargando...</div>

  return (
    <div className="space-y-6 p-6">
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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className={`text-left ${headerClass}`}>
                Nombre
              </th>
              <th scope="col" className={`text-left ${headerClass}`}>
                Creada
              </th>
              {user?.role === 'ADMIN' && (
                <th scope="col" className={`text-right whitespace-nowrap ${headerClass}`}>
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entities.map((entity) => (
              <tr key={entity.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user?.role === 'ADMIN' ? (
                    <Link
                      to={`/financial-entities/${entity.id}`}
                      className="hover:text-indigo-600"
                    >
                      {entity.name}
                    </Link>
                  ) : (
                    entity.name
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(entity.createdAt).toLocaleDateString()}
                </td>
                {user?.role === 'ADMIN' && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(entity.id, entity.name)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Eliminar entidad"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {entities.length === 0 && (
              <tr>
                <td colSpan={user?.role === 'ADMIN' ? 3 : 2} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay entidades registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}