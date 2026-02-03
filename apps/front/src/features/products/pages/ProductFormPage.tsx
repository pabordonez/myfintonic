import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { productService } from '../services/product.service'
import { ValueHistoryList, ValueHistory } from '../../financial-entities/components/ValueHistoryList'

export const ProductFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!id
  const [entities, setEntities] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [valueHistory, setValueHistory] = useState<ValueHistory[]>([])
  const [initialBalance, setInitialBalance] = useState<number | undefined>(undefined)

  const { register, handleSubmit, watch, reset } = useForm()
  const selectedType = watch('type')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Cargar catálogo de entidades
        const entitiesData = await productService.getFinancialEntities()
        setEntities(entitiesData)

        if (isEditMode) {
          const product = await productService.getById(id)

          // Mapear datos al formulario
          reset({
            name: product.name,
            type: product.type,
            financialEntity:
              product.financialEntityId || product.financialEntity,
            //TODO MEJORAR ESTO
            currentBalance: product.currentBalance ?? product.initialBalance,
            initialBalance: product.initialBalance,
            //------
            initialDate: product.initialDate
              ? product.initialDate.split('T')[0]
              : '',
            maturityDate: product.maturityDate
              ? product.maturityDate.split('T')[0]
              : '',
            annualInterestRate: product.annualInterestRate,
            monthlyInterestRate: product.monthlyInterestRate,
            interestPaymentFrequency: product.interestPaymentFrequency,
            numberOfShares: product.numberOfShares,
            numberOfUnits: product.numberOfUnits,
            netAssetValue: product.netAssetValue,
            unitPurchasePrice: product.unitPurchasePrice,
            currentMarketPrice: product.currentMarketPrice,
            // Importante: clientId se carga en el form para visualización o estado interno,
            // pero NO debe enviarse en el PUT.
            clientId: product.clientId,
          })

          if (product.valueHistory) {
            setValueHistory(product.valueHistory)
          }
          if (product.initialBalance != null) {
            setInitialBalance(product.initialBalance)
          }
        }
      } catch (err) {
        console.error(err)
        setError('Error al cargar los datos')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, isEditMode, reset])

  const onSubmit = async (data: any) => {
    try {
      // Preparar datos (conversión de tipos y limpieza) para ambos modos (Create/Update)
      const preparedData = { ...data }

      const numericFields = [
        'annualInterestRate',
        'monthlyInterestRate',
        'numberOfShares',
        'numberOfUnits',
        'netAssetValue',
        'unitPurchasePrice',
        'currentMarketPrice',
        'currentBalance',
        'initialBalance',
      ]
      numericFields.forEach((field) => {
        if (preparedData[field] !== undefined && preparedData[field] !== '') {
          preparedData[field] = Number(preparedData[field])
        }
      })

      Object.keys(preparedData).forEach((key) => {
        if (preparedData[key] === '') delete preparedData[key]
      })

      if (isEditMode) {
        const typeToUse = data.type || selectedType

        // Copiamos y eliminamos campos que no se deben enviar en el update
        const updateData = { ...preparedData }
        const balanceValue = updateData.currentBalance

        delete updateData.clientId
        delete updateData.type
        delete updateData.id
        delete updateData.currentBalance

        // Re-assign balance to the correct field based on type
        if (typeToUse === 'FIXED_TERM_DEPOSIT') {
          updateData.initialBalance = balanceValue
        } else if (typeToUse !== 'STOCKS') {
          updateData.currentBalance = balanceValue
        }

        await productService.update(id as string, updateData)
      } else {
        await productService.create(preparedData)
      }
      navigate('/products')
    } catch (err) {
      console.error(err)
      setError('Error al guardar el producto')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return
    try {
      await productService.delete(id as string)
      navigate('/products')
    } catch (err) {
      console.error(err)
      setError('Error al eliminar el producto')
    }
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? 'Editar Producto' : 'Crear Producto'}
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
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium">
            Tipo
          </label>
          <select
            id="type"
            {...register('type')}
            disabled={isEditMode}
            className="mt-1 block w-full border rounded p-2 bg-white disabled:bg-gray-100"
          >
            <option value="">Seleccione tipo</option>
            <option value="CURRENT_ACCOUNT">Cuenta Corriente</option>
            <option value="SAVINGS_ACCOUNT">Cuenta de Ahorro</option>
            <option value="FIXED_TERM_DEPOSIT">Depósito a Plazo Fijo</option>
            <option value="INVESTMENT_FUND">Fondo de Inversión</option>
            <option value="STOCKS">Acciones</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="financialEntity"
            className="block text-sm font-medium"
          >
            Entidad
          </label>
          <select
            id="financialEntity"
            {...register('financialEntity')}
            className="mt-1 block w-full border rounded p-2"
          >
            <option value="">Seleccione entidad</option>
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>

        {/* Campos dinámicos simplificados para el ejemplo */}
        {selectedType !== 'STOCKS' && (
          <div>
            <label
              htmlFor="currentBalance"
              className="block text-sm font-medium"
            >
              Balance
            </label>
            <input
              id="currentBalance"
              type="number"
              step="0.01"
              {...register('currentBalance')}
              className="mt-1 block w-full border rounded p-2"
            />
          </div>
        )}

        {selectedType === 'FIXED_TERM_DEPOSIT' && (
          <div>
            <label htmlFor="initialDate" className="block text-sm font-medium">
              Fecha Inicio
            </label>
            <input
              id="initialDate"
              type="date"
              {...register('initialDate')}
              className="mt-1 block w-full border rounded p-2"
            />

            <label htmlFor="maturityDate" className="block text-sm font-medium">
              Fecha Vencimiento
            </label>
            <input
              id="maturityDate"
              type="date"
              {...register('maturityDate')}
              className="mt-1 block w-full border rounded p-2"
            />

            <label
              htmlFor="annualInterestRate"
              className="block text-sm font-medium"
            >
              Tasa de Interés Anual
            </label>
            <input
              id="annualInterestRate"
              type="number"
              step="0.0001"
              {...register('annualInterestRate')}
              className="mt-1 block w-full border rounded p-2"
            />

            <label
              htmlFor="interestPaymentFrequency"
              className="block text-sm font-medium"
            >
              Frecuencia de Pago
            </label>
            <select
              id="interestPaymentFrequency"
              {...register('interestPaymentFrequency')}
              className="mt-1 block w-full border rounded p-2"
            >
              <option value="AtMaturity">Al Vencimiento</option>
              <option value="Monthly">Mensual</option>
              <option value="Quarterly">Trimestral</option>
              <option value="Annual">Anual</option>
            </select>
          </div>
        )}

        {selectedType === 'SAVINGS_ACCOUNT' && (
          <div>
            <label
              htmlFor="monthlyInterestRate"
              className="block text-sm font-medium"
            >
              Tasa de Interés Mensual
            </label>
            <input
              id="monthlyInterestRate"
              type="number"
              step="0.0001"
              {...register('monthlyInterestRate')}
              className="mt-1 block w-full border rounded p-2"
            />
          </div>
        )}

        {selectedType === 'INVESTMENT_FUND' && (
          <div>
            <label
              htmlFor="numberOfUnits"
              className="block text-sm font-medium"
            >
              Participaciones
            </label>
            <input
              id="numberOfUnits"
              type="number"
              step="0.0001"
              {...register('numberOfUnits')}
              className="mt-1 block w-full border rounded p-2"
            />

            <label
              htmlFor="netAssetValue"
              className="block text-sm font-medium"
            >
              Valor Liquidativo
            </label>
            <input
              id="netAssetValue"
              type="number"
              step="0.01"
              {...register('netAssetValue')}
              className="mt-1 block w-full border rounded p-2"
            />
          </div>
        )}

        {selectedType === 'STOCKS' && (
          <div>
            <label
              htmlFor="numberOfShares"
              className="block text-sm font-medium"
            >
              Acciones
            </label>
            <input
              id="numberOfShares"
              type="number"
              {...register('numberOfShares')}
              className="mt-1 block w-full border rounded p-2"
            />

            <label
              htmlFor="unitPurchasePrice"
              className="block text-sm font-medium"
            >
              Precio Compra
            </label>
            <input
              id="unitPurchasePrice"
              type="number"
              step="0.01"
              {...register('unitPurchasePrice')}
              className="mt-1 block w-full border rounded p-2"
            />

            <label
              htmlFor="currentMarketPrice"
              className="block text-sm font-medium"
            >
              Precio Mercado
            </label>
            <input
              id="currentMarketPrice"
              type="number"
              step="0.01"
              {...register('currentMarketPrice')}
              className="mt-1 block w-full border rounded p-2"
            />
          </div>
        )}

        <div className="pt-4 flex justify-between">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Guardar
          </button>
          {isEditMode && (
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Eliminar
            </button>
          )}
        </div>
      </form>

      {isEditMode &&
        (selectedType === 'CURRENT_ACCOUNT' ||
          selectedType === 'SAVINGS_ACCOUNT' ||
          selectedType === 'INVESTMENT_FUND') &&
        valueHistory.length > 0 && (
          <div className="mt-8">
            <ValueHistoryList
              history={valueHistory}
              initialBalance={initialBalance}
            />
          </div>
        )}
    </div>
  )
}
