import { PrismaClient, ProductType, ProductStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  // Crear o actualizar el cliente de prueba
  const client = await prisma.client.upsert({
    where: { id: '550e8400-e29b-41d4-a716-446655440000' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      firstName: 'Usuario',
      lastName: 'Prueba',
      nickname: 'testuser'
    },
  });

  console.log('👤 Cliente creado/actualizado:', client.id);

  // Crear Entidades Financieras (Catálogo)
  const santander = await prisma.financialEntity.upsert({
    where: { name: 'Banco Santander' },
    update: {},
    create: { name: 'Banco Santander' },
  });

  await prisma.financialEntity.upsert({
    where: { name: 'BBVA' },
    update: {},
    create: { name: 'BBVA' },
  });

  console.log('🏦 Catálogo de Entidades Financieras actualizado');

  // Crear Relación Cliente-Entidad (ClientFinancialEntity)
  await prisma.clientFinancialEntity.upsert({
    where: {
      clientId_financialEntityId: {
        clientId: client.id,
        financialEntityId: santander.id,
      },
    },
    update: {},
    create: {
      clientId: client.id,
      financialEntityId: santander.id,
      balance: 15000.00,
      initialBalance: 15000.00,
    },
  });

  console.log('🔗 Cliente vinculado a entidades financieras');

  // Crear un producto de ejemplo si no existe ninguno para este cliente
  const productsCount = await prisma.financialProduct.count({ where: { clientId: client.id } });
  
  if (productsCount === 0) {
    await prisma.financialProduct.create({
      data: {
        id: randomUUID(),
        type: ProductType.CURRENT_ACCOUNT,
        name: 'Cuenta Nómina Principal',
        status: ProductStatus.ACTIVE,
        clientId: client.id,
        financialEntityId: santander.id,
        currentBalance: 2500.50,
      }
    });
    console.log('📦 Producto financiero de ejemplo creado');
  }

  console.log('✅ Seed completado exitosamente');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });