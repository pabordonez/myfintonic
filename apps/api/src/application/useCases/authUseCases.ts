import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { IClientRepository } from '@domain/repository/IClientRepository'
import { env } from '@config/env'

export class AuthUseCases {
  constructor(private readonly clientRepository: IClientRepository) {}

  async login(data: any) {
    const { email, password } = data
    if (!email || !password) throw new Error('Invalid credentials')

    const user = await this.clientRepository.findByEmail(email)
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