import {
  IFinancialProduct,
  FinancialProduct,
} from '@domain/models/financialProduct'
import { IProductRepository } from '@domain/repository/IProductRepository'
import prisma from '@infrastructure/persistence/prisma/repository/prismaClient'
import {
  PrismaProductMapper,
  PrismaProductUpdateInput,
} from '@infrastructure/persistence/prisma/mappers/PrismaProductMapper'

export class PrismaProductRepository implements IProductRepository {
  async create(product: FinancialProduct): Promise<FinancialProduct> {
    const data = PrismaProductMapper.toPrismaCreate(product)
    try {
      const createdProduct = await prisma.financialProduct.create({
        data: data,
        include: {
          financialEntity: true,
          valueHistory: true,
          transactions: true,
          client: true,
        },
      })
      return PrismaProductMapper.toDomain(createdProduct)
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error(
          `Financial Entity with ID '${product.financialEntity}' not found`
        )
      }
      throw error
    }
  }

  async update(id: string, product: Partial<IFinancialProduct>): Promise<void> {
    const p = product as PrismaProductUpdateInput
    const data = PrismaProductMapper.toPrismaUpdate(p)

    // 2. Lógica de Historial (Business Rule en Infra - Deuda técnica aceptada por ahora)
    // Idealmente esto debería venir resuelto desde el Dominio, no calculado aquí.
    const newValue = p.currentBalance
    if (newValue !== undefined && newValue !== null) {
      const currentProduct = await prisma.financialProduct.findUnique({
        where: { id },
        select: { currentBalance: true },
      })
      const previousValue = currentProduct?.currentBalance
        ? Number(currentProduct.currentBalance)
        : null

      if (previousValue !== newValue) {
        data.valueHistory = {
          create: {
            date: new Date(),
            value: newValue,
            previousValue: previousValue ?? null,
          },
        }
      }
    }

    try {
      await prisma.financialProduct.update({
        where: { id },
        data: data,
      })
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error(
          `Financial Entity with ID '${product.financialEntity}' not found`
        )
      }
      throw error
    }
  }

  async findById(id: string): Promise<FinancialProduct | null> {
    const prismaProduct = await prisma.financialProduct.findFirst({
      where: { id },
      include: {
        financialEntity: true,
        valueHistory: true,
        transactions: true,
        client: true,
      },
    })

    if (!prismaProduct) return null

    return PrismaProductMapper.toDomain(prismaProduct)
  }

  async findAll(
    filters?: Partial<IFinancialProduct>
  ): Promise<FinancialProduct[]> {
    const where: any = {}

    if (filters?.clientId) where.clientId = filters.clientId
    if (filters?.status) where.status = filters.status as any
    if (filters?.type) where.type = filters.type as any
    if (filters?.financialEntity)
      where.financialEntity = { name: filters.financialEntity }

    const prismaProducts = await prisma.financialProduct.findMany({
      where,
      include: {
        financialEntity: true,
        valueHistory: true,
        transactions: true,
        client: true,
      },
    })

    return prismaProducts.map((p: any) => PrismaProductMapper.toDomain(p))
  }

  async delete(id: string): Promise<void> {
    await prisma.financialProduct.delete({
      where: { id },
    })
  }
}
