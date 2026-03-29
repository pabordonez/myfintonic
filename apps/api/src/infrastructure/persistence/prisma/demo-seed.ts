import bcrypt from 'bcrypt'
import { env } from '@infrastructure/config/env'
import { PrismaClient, ProductType, ProductStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting the demo data load (Demo Seed)...')

  // 1. Initial cleanup (optional, comment it out if you prefer not to delete previous data)
  await prisma.productTransaction.deleteMany()
  await prisma.valueHistory.deleteMany()
  await prisma.financialProduct.deleteMany()
  await prisma.clientFinancialEntityValueHistory.deleteMany()
  await prisma.clientFinancialEntity.deleteMany()
  await prisma.financialEntity.deleteMany()
  await prisma.client.deleteMany()

  // 2. Create the test user (Brais Moure)
  const braisId = 'usr-demo-brais-0000-0000-00000000'
  const brais = await prisma.client.upsert({
    where: { email: 'braismoure@myfintonic.com' },
    update: {},
    create: {
      id: braisId,
      firstName: 'Brais',
      lastName: 'Moure',
      nickname: 'mouredev',
      email: 'braismoure@myfintonic.com',
      password: await bcrypt.hash('User1234!', 10),
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  console.log(`✅ User created: ${brais.email}`)

  const adminEmail = env.ADMIN_EMAIL
  const adminPassword = await bcrypt.hash(env.ADMIN_PASSWORD, 10)

  const admin = await prisma.client.create({
    data: {
      email: adminEmail,
      password: adminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      nickname: 'admin',
      role: 'ADMIN',
    },
  })
  console.log(`✅ Admin user created: ${admin.email}`)

  // 3. Create example Financial Entities
  const entityBankId = 'ent-demo-bank-0000-0000-00000001'
  const entityBrokerId = 'ent-demo-brok-0000-0000-00000002'

  await prisma.financialEntity.upsert({
    where: { id: entityBankId },
    update: {},
    create: {
      id: entityBankId,
      name: 'Fictional Iberian Bank',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  await prisma.financialEntity.upsert({
    where: { id: entityBrokerId },
    update: {},
    create: {
      id: entityBrokerId,
      name: 'Global Tech Broker',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  console.log(`✅ Financial entities created.`)

  // 4. Create Financial Products and Value History
  const now = new Date()
  const daysAgo = (days: number) =>
    new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  // ---> Current Account
  await prisma.financialProduct.create({
    data: {
      id: 'prod-curr-demo-0000-0000-00000001',
      type: ProductType.CURRENT_ACCOUNT,
      name: 'Main Payroll Account',
      status: ProductStatus.ACTIVE,
      clientId: braisId,
      financialEntityId: entityBankId,
      currentBalance: 4250.75,
      createdAt: now,
      updatedAt: now,
      // Balance history for the last few months
      valueHistory: {
        create: [
          { date: daysAgo(90), value: 3100.0 },
          { date: daysAgo(60), value: 3800.5, previousValue: 3100.0 },
          { date: daysAgo(30), value: 3650.0, previousValue: 3800.5 },
          { date: now, value: 4250.75, previousValue: 3650.0 },
        ],
      },
    },
  })

  // ---> Investment Fund
  // (120 units x NAV of 205.50 = 24,660.00 current balance)
  await prisma.financialProduct.create({
    data: {
      id: 'prod-fund-demo-0000-0000-00000002',
      type: ProductType.INVESTMENT_FUND,
      name: 'S&P 500 Index Fund',
      status: ProductStatus.ACTIVE,
      clientId: braisId,
      financialEntityId: entityBrokerId,
      currentBalance: 24660.0,
      numberOfUnits: 120,
      netAssetValue: 205.5,
      createdAt: now,
      updatedAt: now,
      valueHistory: {
        create: [
          { date: daysAgo(120), value: 21000.0 },
          { date: daysAgo(90), value: 22500.0, previousValue: 21000.0 },
          { date: daysAgo(60), value: 23100.0, previousValue: 22500.0 },
          { date: daysAgo(30), value: 24200.0, previousValue: 23100.0 },
          { date: now, value: 24660.0, previousValue: 24200.0 },
        ],
      },
    },
  })

  // ---> Stocks
  // (50 shares x Current Price of 135.20 = 6,760.00 current balance. Bought at 110.00 = 5,500.00 initial)
  await prisma.financialProduct.create({
    data: {
      id: 'prod-stck-demo-0000-0000-00000003',
      type: 'STOCKS',
      name: 'Innovatech Corp Stocks',
      status: 'ACTIVE',
      clientId: braisId,
      financialEntityId: entityBrokerId,
      initialBalance: 5500.0,
      currentBalance: 6760.0,
      numberOfShares: 50,
      unitPurchasePrice: 110.0,
      currentMarketPrice: 135.2,
      createdAt: now,
      updatedAt: now,
      valueHistory: {
        create: [
          { date: daysAgo(150), value: 5500.0 }, // Time of purchase
          { date: daysAgo(90), value: 6100.0, previousValue: 5500.0 },
          { date: daysAgo(30), value: 6450.0, previousValue: 6100.0 },
          { date: now, value: 6760.0, previousValue: 6450.0 },
        ],
      },
    },
  })

  console.log(
    `✅ Financial products (Accounts, Funds, Stocks) and demo history created.`
  )
  console.log('🌲 Demo seeding finished successfully.')
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
