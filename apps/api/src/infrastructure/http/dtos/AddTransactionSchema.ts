import { z } from 'zod'

export const AddTransactionSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  // Coerce permite convertir strings ISO a objetos Date automáticamente
  date: z.coerce.date({ required_error: 'Date is required', invalid_type_error: 'Invalid date format' }),
  amount: z.number({ required_error: 'Amount is required', invalid_type_error: 'Amount must be a number' }),
})

export type AddTransactionSchemaType = z.infer<typeof AddTransactionSchema>