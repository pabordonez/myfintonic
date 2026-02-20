import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { z } from 'zod'

const prisma = new PrismaClient()

const envSchema = z.object({
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
})

async function main() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = envSchema.parse(process.env)
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)

  const admin = await prisma.client.upsert({
    where: { email: ADMIN_EMAIL },
    update: {}, // Si existe, no hacemos nada (o podrías actualizar la password si quisieras)
    create: {
      firstName: 'Admin',
      lastName: 'System',
      nickname: 'admin',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log(`Admin user upserted: ${admin.email}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
