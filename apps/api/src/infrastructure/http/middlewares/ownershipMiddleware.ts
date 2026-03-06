import { Request, Response, NextFunction } from 'express'
import prisma from '@infrastructure/persistence/prisma/repository/prismaClient'

export const productOwnershipMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Admin Bypass
    if (req.user?.role === 'ADMIN') {
      next()
      return
    }

    const productId = req.params.id as string
    const userId = req.user?.id

    if (!productId || !userId) {
      res.status(400).json({ error: 'Invalid request context' })
      return
    }

    const product = await prisma.financialProduct.findUnique({
      where: { id: productId },
      select: { clientId: true },
    })

    if (!product || product.clientId !== userId) {
      res.status(404).json({ error: 'Product not found' })
      return
    }

    next()
  } catch {
    res.status(500).json({ error: 'Internal Server Error checking ownership' })
  }
}
