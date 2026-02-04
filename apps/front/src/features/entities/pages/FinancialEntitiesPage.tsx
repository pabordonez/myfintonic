import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../../../config/api'

export const FinancialEntitiesPage = () => {
  const navigate = useNavigate()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

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
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/financial-entities`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setData(response.data)
    } catch (err) {
      console.error(err)
      setError('Error al cargar las entidades.')
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.clear()
        navigate('/auth/login')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg font-medium text-gray-500">
          Cargando entidades...
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Entidades Financieras
        </h1>
        {role === 'ADMIN' && (
          <Link
            to="/financial-entities/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Nueva Entidad
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {data.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No hay entidades disponibles.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actualizado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item: any) => (
                  <tr key={item.id}>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                      onClick={() => navigate(`/financial-entities/${item.id}`)}
                    >
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '-'}
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
