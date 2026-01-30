import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '@infrastructure/persistence/prisma/client'
import { env } from '@config/env'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
})

export class AuthUseCases {
  async register(data: any) {
    const validated = registerSchema.parse(data)
    
    const existing = await prisma.client.findUnique({ where: { email: validated.email } })
    if (existing) throw new Error('Email already in use')

    const hashedPassword = await bcrypt.hash(validated.password, 10)

    const user = await prisma.client.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        firstName: validated.firstName,
        lastName: validated.lastName,
        role: 'USER' // Siempre USER por defecto en registro público
      }
    })

    return { id: user.id, email: user.email, role: user.role }
  }

  async login(data: any) {
    const { email, password } = data
    if (!email || !password) throw new Error('Invalid credentials')

    const user = await prisma.client.findUnique({ where: { email } }) as any // Cast any temporal hasta actualizar modelo
    if (!user) throw new Error('Invalid credentials')

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) throw new Error('Invalid credentials')

    const token = jwt.sign(
      { id: user.id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    return {
      token,
      user: { id: user.id, email: user.email, role: user.role }
    }
  }
}