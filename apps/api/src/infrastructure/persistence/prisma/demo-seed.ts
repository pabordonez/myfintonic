import bcrypt from 'bcrypt'
import { env } from '@infrastructure/config/env'
import { PrismaClient, ProductType, ProductStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando la carga de datos de demostración (Demo Seed)...')

  // 1. Limpieza inicial (opcional, coméntalo si prefieres no borrar datos previos)
  await prisma.productTransaction.deleteMany()
  await prisma.valueHistory.deleteMany()
  await prisma.financialProduct.deleteMany()
  await prisma.clientFinancialEntityValueHistory.deleteMany()
  await prisma.clientFinancialEntity.deleteMany()
  await prisma.financialEntity.deleteMany()
  await prisma.client.deleteMany()

  // 2. Crear al usuario de prueba (Brais Moure)
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
  console.log(`✅ Usuario creado: ${brais.email}`)

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

  // 3. Crear Entidades Financieras de ejemplo
  const entityBankId = 'ent-demo-bank-0000-0000-00000001'
  const entityBrokerId = 'ent-demo-brok-0000-0000-00000002'

  await prisma.financialEntity.upsert({
    where: { id: entityBankId },
    update: {},
    create: {
      id: entityBankId,
      name: 'Banco Ibérico Ficticio',
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
  console.log(`✅ Entidades financieras creadas.`)

  // 4. Crear Productos Financieros e Histórico de Valores
  const now = new Date()
  const daysAgo = (days: number) =>
    new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  // ---> Cuenta Corriente
  await prisma.financialProduct.create({
    data: {
      id: 'prod-curr-demo-0000-0000-00000001',
      type: ProductType.CURRENT_ACCOUNT,
      name: 'Cuenta Nómina Principal',
      status: ProductStatus.ACTIVE,
      clientId: braisId,
      financialEntityId: entityBankId,
      currentBalance: 4250.75,
      createdAt: now,
      updatedAt: now,
      // Histórico de saldo de los últimos meses
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

  // ---> Fondo de Inversión
  // (120 participaciones x NAV de 205.50 = 24,660.00 de balance actual)
  await prisma.financialProduct.create({
    data: {
      id: 'prod-fund-demo-0000-0000-00000002',
      type: ProductType.INVESTMENT_FUND,
      name: 'Fondo Indexado S&P 500',
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

  // ---> Acciones
  // (50 acciones x Precio Actual de 135.20 = 6,760.00 de balance actual. Compra a 110.00 = 5,500.00 inicial)
  await prisma.financialProduct.create({
    data: {
      id: 'prod-stck-demo-0000-0000-00000003',
      type: 'STOCKS',
      name: 'Acciones Innovatech Corp',
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
          { date: daysAgo(150), value: 5500.0 }, // Momento de compra
          { date: daysAgo(90), value: 6100.0, previousValue: 5500.0 },
          { date: daysAgo(30), value: 6450.0, previousValue: 6100.0 },
          { date: now, value: 6760.0, previousValue: 6450.0 },
        ],
      },
    },
  })

  console.log(
    `✅ Productos financieros (Cuentas, Fondos, Acciones) e histórico de demostración creados.`
  )
  console.log('🌲 Seeding de demostración finalizado correctamente.')
}

main()
  .catch((e) => {
    console.error('Error durante el seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
