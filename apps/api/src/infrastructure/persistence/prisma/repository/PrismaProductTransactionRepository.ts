import { IProductTransactionRepository } from '@domain/repository/IProductTransactionRepository'
import {
  IProductTransactionDetail,
  ProductTransaction,
} from '@domain/models/productTransaction'
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
    transaction: ProductTransaction
  ): Promise<IProductTransactionDetail> {
    const { productId, amount, date, description } = transaction

    const createdTransaction = await prisma.productTransaction.create({
      data: {
        id: transaction.id,
        productId,
        description,
        amount,
        date,
      },
    })

    return this.mapToDomain(createdTransaction)
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
