import { IProductTransactionRepository } from '@domain/repository/IProductTransactionRepository'
import {
  IProductTransaction,
  IProductTransactionDetail,
} from '@domain/entities/IProductTransaction'
import prisma from '@infrastructure/persistence/prisma/client'

export class PrismaProductTransactionRepository implements IProductTransactionRepository {
  async findById(id: string): Promise<IProductTransactionDetail | null> {
    const tx = await prisma.productTransaction.findUnique({ where: { id } })
    if (!tx) return null
    return this.mapToDomain(tx)
  }

  async findAllByProductId(
    productId: string
  ): Promise<IProductTransactionDetail[]> {
    const txs = await prisma.productTransaction.findMany({
      where: { productId },
      orderBy: { date: 'desc' },
    })
    return txs.map((tx) => this.mapToDomain(tx))
  }

  async addTransaction(
    params: IProductTransaction
  ): Promise<IProductTransactionDetail> {
    const { productId, amount, date, description } = params

    // Ejecutamos todo dentro de una transacción interactiva de Prisma
    // para asegurar consistencia ACID (Saldo + Transacción + Histórico)
    return await prisma.$transaction(async (tx) => {
      // 1. Obtener el producto actual para calcular el nuevo saldo
      // Usamos findUniqueOrThrow para asegurar que existe y bloquear si fuera necesario (dependiendo del nivel de aislamiento)
      const product = await tx.financialProduct.findUniqueOrThrow({
        where: { id: productId },
      })

      // 2. Crear el registro de la transacción
      const transaction = await tx.productTransaction.create({
        data: {
          productId,
          description,
          amount,
          date,
        },
      })

      // 3. Actualizar el saldo del producto
      const currentBalance = Number(product.currentBalance || 0)
      const newBalance = currentBalance + amount

      await tx.financialProduct.update({
        where: { id: productId },
        data: { currentBalance: newBalance },
      })

      // 4. Registrar el cambio en el historial de valor
      await tx.valueHistory.create({
        data: {
          productId,
          date: new Date(),
          value: newBalance,
          previousValue: currentBalance,
        },
      })

      return this.mapToDomain(transaction)
    })
  }

  private mapToDomain(prismaTx: any): IProductTransactionDetail {
    return {
      id: prismaTx.id,
      description: prismaTx.description,
      date: prismaTx.date,
      amount: Number(prismaTx.amount),
    }
  }
}
