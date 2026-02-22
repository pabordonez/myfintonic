import { IProductTransactionRepository } from '@domain/repository/IProductTransactionRepository'
import { IProductTransactionDetail } from '@domain/entities/IProductTransaction'
import prisma from '@infrastructure/persistence/prisma/repository/prismaClient'
import { productTransactionEntity } from '@domain/factories/productTransactionEntity'

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
    transaction: productTransactionEntity
  ): Promise<IProductTransactionDetail> {
    const { productId, amount, date, description } = transaction

    // Ejecutamos todo dentro de una transacción interactiva de Prisma
    // para asegurar consistencia ACID ( Transacción )
    return await prisma.$transaction(async (tx) => {
      // 1. Obtener el producto para verificar tipo y saldo actual
      await tx.financialProduct.findUniqueOrThrow({
        where: { id: productId },
      })

      const createdTransaction = await tx.productTransaction.create({
        data: {
          id: transaction.id,
          productId,
          description,
          amount,
          date,
        },
      })

      return this.mapToDomain(createdTransaction)
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
