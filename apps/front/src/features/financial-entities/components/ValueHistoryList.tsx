import { ArrowDown, ArrowUp, Minus } from 'lucide-react'

export interface ValueHistory {
  date: string | Date
  value: number
  previousValue: number
}

interface ValueHistoryListProps {
  history: ValueHistory[]
  initialBalance?: number
}

export const ValueHistoryList = ({ history, initialBalance }: ValueHistoryListProps) => {
  // Ordenar por fecha descendente (más reciente primero) y tomar los últimos 10
  const sortedHistory = [...history]
    .filter((item) => item.previousValue != null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value)
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const calculatePercentage = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  if (sortedHistory.length === 0) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6 text-center text-gray-500">
        No hay historial disponible.
      </div>
    )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Histórico de Valoraciones
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Últimos 10 movimientos registrados.
          </p>
        </div>
        {initialBalance !== undefined && initialBalance !== 0 && (
          <div
            className={`flex items-center px-3 py-1 rounded-full text-sm font-bold ${
              ((sortedHistory[0].value - initialBalance) / initialBalance) * 100 > 0
                ? 'bg-green-100 text-green-800'
                : ((sortedHistory[0].value - initialBalance) / initialBalance) * 100 < 0
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {((sortedHistory[0].value - initialBalance) / initialBalance) * 100 > 0 ? (
              <ArrowUp className="w-4 h-4 mr-1" />
            ) : ((sortedHistory[0].value - initialBalance) / initialBalance) * 100 < 0 ? (
              <ArrowDown className="w-4 h-4 mr-1" />
            ) : (
              <Minus className="w-4 h-4 mr-1" />
            )}
            Total: {Math.abs(((sortedHistory[0].value - initialBalance) / initialBalance) * 100).toFixed(2)}%
          </div>
        )}
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {sortedHistory.map((item, index) => {
            const percentage = calculatePercentage(item.value, item.previousValue)
            const isPositive = percentage > 0
            const isNegative = percentage < 0

            return (
              <li key={index} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {formatDate(item.date)}
                    </p>
                    <div className="flex text-sm text-gray-500 gap-2">
                      <span>Prev: {formatCurrency(item.previousValue)}</span>
                      <span>→</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div
                      className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isPositive
                          ? 'bg-green-100 text-green-800'
                          : isNegative
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUp className="w-3 h-3 mr-1" />
                      ) : isNegative ? (
                        <ArrowDown className="w-3 h-3 mr-1" />
                      ) : (
                        <Minus className="w-3 h-3 mr-1" />
                      )}
                      {Math.abs(percentage).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}