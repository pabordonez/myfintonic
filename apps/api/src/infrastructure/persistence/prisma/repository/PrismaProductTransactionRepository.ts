import { IProductTransactionRepository } from '@domain/repository/IProductTransactionRepository'
import {
  IProductTransaction,
  IProductTransactionDetail,
} from '@domain/entities/IProductTransaction'
import prisma from '@infrastructure/persistence/prisma/repository/prismaClient'

export class PrismaProductTransactionRepository implements IProductTransactionRepository {
  async findById(id: string): Promise<IProductTransactionDetail | null> {
    const productTransaction = await prisma.productTransaction.findUnique({
      where: { id },
    })
    if (!productTransaction) return null
    return this.mapToDomain(productTransaction)
  }

  async findAllByProductId(
    productId: string
  ): Promise<IProductTransactionDetail[]> {
    const productTransactions = await prisma.productTransaction.findMany({
      where: { productId },
      orderBy: { date: 'desc' },
    })
    return productTransactions.map((tx) => this.mapToDomain(tx))
  }

  async addTransaction(
    params: IProductTransaction
  ): Promise<IProductTransactionDetail> {
    const { productId, amount, date, description } = params

    // Ejecutamos todo dentro de una transacción interactiva de Prisma
    // para asegurar consistencia ACID ( Transacción )
    return await prisma.$transaction(async (tx) => {
      // 1. Obtener el producto para verificar tipo y saldo actual
      await tx.financialProduct.findUniqueOrThrow({
        where: { id: productId },
      })

      const transaction = await tx.productTransaction.create({
        data: {
          productId,
          description,
          amount,
          date,
        },
      })

      return this.mapToDomain(transaction)
    })
  }

  private mapToDomain(transaction: any): IProductTransactionDetail {
    return {
      id: transaction.id,
      description: transaction.description,
      date: transaction.date,
      amount: Number(transaction.amount),
    }
  }
}
