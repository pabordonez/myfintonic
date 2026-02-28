import { z } from 'zod'
import { api } from '../../../config/api'

// Helpers para convertir strings numéricos (común en APIs que devuelven Decimal/BigInt como string)
const CoercedNullableNumber = z.preprocess((val) => {
  if (val === null) return null
  if (typeof val === 'string' && val.trim() !== '') return Number(val)
  return val
}, z.number().nullable().optional())

const CoercedOptionalNumber = z.preprocess((val) => {
  if (val === null) return undefined
  if (typeof val === 'string' && val.trim() !== '') return Number(val)
  return val
}, z.number().optional())

// Esquema de validación de respuesta (Defense in Depth)
// Asegura que los datos recibidos del API cumplan con la estructura esperada
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  financialEntityId: z.string().optional().nullable(),
  financialEntityName: z.string().optional().nullable(),
  status: z.string().optional(),
  currentBalance: CoercedNullableNumber,
  initialBalance: CoercedNullableNumber,
  // Campos específicos
  numberOfUnits: CoercedOptionalNumber,
  netAssetValue: CoercedOptionalNumber,
  numberOfShares: CoercedOptionalNumber,
  unitPurchasePrice: CoercedOptionalNumber,
  currentMarketPrice: CoercedOptionalNumber,
  initialDate: z.string().or(z.date()).optional(),
  maturityDate: z.string().or(z.date()).optional(),
  annualInterestRate: CoercedOptionalNumber,
  monthlyInterestRate: CoercedOptionalNumber,
  interestPaymentFrequency: z.string().optional(),
  // Relaciones
  clientId: z.string().optional().nullable(),
  client: z
    .object({
      firstName: z.string(),
      lastName: z.string(),
    })
    .optional()
    .nullable(),
  valueHistory: z.array(z.any()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
})

const ProductListSchema = z.array(ProductSchema)

export const productService = {
  getAll: async () => {
    const response = await api.get('/products')
    return ProductListSchema.parse(response.data)
  },
  getById: async (id: string) => {
    const response = await api.get(`/products/${id}`)
    return ProductSchema.parse(response.data)
  },
  create: async (data: any) => {
    const response = await api.post('/products', data)
    return ProductSchema.parse(response.data)
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/products/${id}`, data)
    if (response.data) {
      return ProductSchema.parse(response.data)
    }
    return response.data
  },
  delete: async (id: string) => {
    await api.delete(`/products/${id}`)
  },
  patch: async (id: string, data: any) => {
    const response = await api.patch(`/products/${id}`, data)
    if (response.data) {
      return ProductSchema.parse(response.data)
    }
    return response.data
  },
}
