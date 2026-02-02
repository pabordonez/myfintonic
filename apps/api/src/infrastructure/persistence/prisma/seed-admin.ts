import prisma from './client'
import bcrypt from 'bcrypt'
import { env } from '@config/env'

async function main() {
  const adminEmail = env.ADMIN_EMAIL
  
  const existingAdmin = await prisma.client.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    console.log(`Creating default admin user: ${adminEmail}`)
    const hashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, 10)
    
    await prisma.client.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        firstName: 'Super',
        lastName: 'Admin'
      }
    })
  }
}

main().catch(console.error)