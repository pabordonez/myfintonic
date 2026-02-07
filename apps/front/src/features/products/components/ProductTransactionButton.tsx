import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ProductType } from '../types/transaction.types'

interface Props {
  productType: string
  productId: string
}

const ALLOWED_TYPES = [
  ProductType.CURRENT_ACCOUNT,
  ProductType.SAVINGS_ACCOUNT,
  'CURRENT_ACCOUNT',
  'SAVINGS_ACCOUNT',
]

export const ProductTransactionButton: React.FC<Props> = ({
  productType,
  productId,
}) => {
  const navigate = useNavigate()

  if (!productId || !ALLOWED_TYPES.includes(productType)) {
    return null
  }

  return (
    <button
      onClick={() => navigate(`/products/${productId}/transactions`)}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
      type="button"
    >
      Ver Transacciones
    </button>
  )
}
