import { IProductTransactionRepository, AddTransactionParams } from '@domain/repository/IProductTransactionRepository'
import { IFinancialProduct } from '@domain/entities/IFinancialProduct'
import { ProductTransaction } from '@domain/entities/ProductTransaction'
import prisma from '@infrastructure/persistence/prisma/client';


export class PrismaFinancialProductRepository implements IProductTransactionRepository {

  async findById(id: string): Promise<IFinancialProduct | null> {
    const product = await prisma.financialProduct.findUnique({
      where: { id },
    })

    if (!product) return null

    // Mapeo básico a la entidad de dominio.
    // Nota: Prisma usa Decimal para montos, aquí convertimos a Number para el dominio.
    return {
      ...product,
      currentBalance: Number(product.currentBalance),
      // Casteamos el tipo porque Prisma devuelve string y el dominio espera el Enum
      type: product.type as any, 
    } as unknown as IFinancialProduct
  }

  async addTransaction(params: AddTransactionParams): Promise<ProductTransaction> {
    const { productId, description, date, amount } = params

    return prisma.$transaction(async (tx) => {
      // 1. Crear la transacción
      const transaction = await tx.productTransaction.create({
        data: {
          productId,
          description,
          date,
          amount,
        },
      })

      // Mapear respuesta a entidad de Dominio
      return {
        id: transaction.id,
        productId: transaction.productId,
        description: transaction.description,
        date: transaction.date,
        amount: Number(transaction.amount),
      }
    })
  }
}