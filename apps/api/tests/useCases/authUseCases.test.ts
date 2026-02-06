import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthUseCases } from '../../src/application/useCases/authUseCases'
import prisma from '../../src/infrastructure/persistence/prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

vi.mock('../../src/infrastructure/persistence/prisma/client', () => ({
  default: {
    client: {
      findUnique: vi.fn(),
    }
  }
}))

vi.mock('bcrypt')
vi.mock('jsonwebtoken')

const useCases = new AuthUseCases()

describe('AuthUseCases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should throw if email or password missing', async () => {
      await expect(useCases.login({ email: '' })).rejects.toThrow('Invalid credentials')
      await expect(useCases.login({ password: '' })).rejects.toThrow('Invalid credentials')
    })

    it('should throw if user not found', async () => {
      vi.mocked(prisma.client.findUnique).mockResolvedValue(null)
      await expect(useCases.login({ email: 'test@test.com', password: '123' })).rejects.toThrow('Invalid credentials')
    })

    it('should throw if password invalid', async () => {
      vi.mocked(prisma.client.findUnique).mockResolvedValue({ password: 'hash' } as any)
      vi.mocked(bcrypt.compare).mockResolvedValue(false as any)
      await expect(useCases.login({ email: 'test@test.com', password: '123' })).rejects.toThrow('Invalid credentials')
    })

    it('should return token if valid', async () => {
      vi.mocked(prisma.client.findUnique).mockResolvedValue({ id: '1', email: 'test@test.com', password: 'hash', role: 'USER' } as any)
      vi.mocked(bcrypt.compare).mockResolvedValue(true as any)
      vi.mocked(jwt.sign).mockReturnValue('token' as any)

      const result = await useCases.login({ email: 'test@test.com', password: '123' })
      expect(result).toEqual({
        token: 'token',
        user: { id: '1', email: 'test@test.com', role: 'USER' }
      })
    })
  })
})