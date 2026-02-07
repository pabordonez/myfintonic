import { Request, Response } from 'express'
import { z } from 'zod'
import { ProductTransactionUseCases } from '@application/useCases/ProductTransactionUseCases'
import { AddTransactionSchema } from '@infrastructure/http/dtos/AddTransactionSchema'

export class ProductTransactionController {
  constructor(private readonly useCase: ProductTransactionUseCases) {}

  addTransaction = async (req: Request, res: Response) => {
    try {
      const productId = req.params.id as string
      // Asumimos que el middleware de autenticación inyecta el usuario en req.user
      const userId = (req as any).user?.id

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // 1. Validación de Infraestructura (Zod)
      // Si falla, lanza un error que capturamos abajo
      const dto = AddTransactionSchema.parse(req.body)

      // 2. Ejecución del Caso de Uso
      await this.useCase.add({
        userId,
        productId,
        ...dto,
      })

      return res.status(201).json({ message: 'Transaction added successfully' })
    } catch (error: any) {
      // Manejo de errores de validación (400)
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: 'Validation Error', details: error.errors })
      }

      // Manejo de errores de Dominio
      if (error.message === 'Product not found') {
        return res.status(404).json({ error: error.message })
      }
      if (error.message === 'Unauthorized access to product') {
        return res.status(403).json({ error: error.message })
      }
      if (error.message.includes('not allowed for product type')) {
        return res.status(400).json({ error: error.message })
      }

      console.error('Unexpected error:', error)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  getTransaction = async (req: Request, res: Response) => {
    try {
      const productId = req.params.id as string
      const transactions = await this.useCase.getProductTransactions(productId)
      return res.status(200).json(transactions)
    } catch (error: any) {
      if (error.message === 'Product not found') {
        return res.status(404).json({ error: error.message })
      }
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
}
