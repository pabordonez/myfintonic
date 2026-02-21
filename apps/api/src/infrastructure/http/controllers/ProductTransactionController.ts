import { Request, Response, NextFunction } from 'express'
import { ProductTransactionUseCases } from '@application/useCases/productTransactionUseCases'
import { AddTransactionSchema } from '@infrastructure/http/dtos/addTransactionSchema'
import { ProductTransactionDto } from '@application/dtos/productTransactionDto'

export class ProductTransactionController {
  constructor(private readonly useCase: ProductTransactionUseCases) {}

  addTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = req.params.id as string
      const userId = (req as any).user?.id

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      //TODO: Deberia esta validacion hacerla en la capa de dominio, pero como hacerlo con ZOD
      const productTransactionDto: ProductTransactionDto = {
        userId,
        productId,
        ...AddTransactionSchema.parse(req.body),
      }

      await this.useCase.add(productTransactionDto)

      return res.status(201).json({ message: 'Transaction added successfully' })
    } catch (error: any) {
      next(error)
    }
  }

  getTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = req.params.id as string
      const transactions = await this.useCase.getProductTransactions(productId)
      return res.status(200).json(transactions)
    } catch (error: any) {
      next(error)
    }
  }
}
