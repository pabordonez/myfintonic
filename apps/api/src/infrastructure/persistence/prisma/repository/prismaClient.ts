import { PrismaClient } from '@prisma/client'
import { env } from '@infrastructure/config/env'

const prismaBase = new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
})

const prisma = prismaBase.$extends({
  name: 'soft-delete',
  query: {
    $allModels: {
      async delete({ model, args, query }) {
        const softDeleteModels = [
          'Client',
          'FinancialProduct',
          'FinancialEntity',
          'ClientFinancialEntity',
        ]
        if (softDeleteModels.includes(model)) {
          return (prismaBase as any)[model].update({
            ...args,
            data: { deletedAt: new Date() },
          })
        }
        return query(args)
      },
      async deleteMany({ model, args, query }) {
        const softDeleteModels = [
          'Client',
          'FinancialProduct',
          'FinancialEntity',
          'ClientFinancialEntity',
        ]
        if (softDeleteModels.includes(model)) {
          return (prismaBase as any)[model].updateMany({
            ...args,
            data: { deletedAt: new Date() },
          })
        }
        return query(args)
      },
      async findMany({ model, args, query }) {
        const softDeleteModels = [
          'Client',
          'FinancialProduct',
          'FinancialEntity',
          'ClientFinancialEntity',
        ]
        if (softDeleteModels.includes(model)) {
          args.where = { ...args.where, deletedAt: null } as any
        }
        return query(args)
      },
      async findFirst({ model, args, query }) {
        const softDeleteModels = [
          'Client',
          'FinancialProduct',
          'FinancialEntity',
          'ClientFinancialEntity',
        ]
        if (softDeleteModels.includes(model)) {
          args.where = { ...args.where, deletedAt: null } as any
        }
        return query(args)
      },
      async findUnique({ model, args, query }) {
        const softDeleteModels = [
          'Client',
          'FinancialProduct',
          'FinancialEntity',
          'ClientFinancialEntity',
        ]
        if (softDeleteModels.includes(model)) {
          return (prismaBase as any)[model].findFirst({
            where: { ...args.where, deletedAt: null },
          })
        }
        return query(args)
      },
    },
  },
})

export default prisma
