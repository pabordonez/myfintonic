import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import bcrypt from 'bcrypt'

// Mock Prisma to avoid touching real DB
const { mockDb } = vi.hoisted(() => ({ mockDb: [] as any[] }))

vi.mock(
  '../src/infrastructure/persistence/prisma/repository/prismaClient',
  () => {
    return {
      default: {
        client: {
          findUnique: vi.fn().mockImplementation(async ({ where }) => {
            return mockDb.find((u) => u.email === where.email) || null
          }),
          create: vi.fn().mockImplementation(async ({ data }) => {
            const existing = mockDb.find((u) => u.email === data.email)
            if (existing) {
              const error: any = new Error('Unique constraint failed')
              error.code = 'P2002'
              throw error
            }
            const newUser = {
              id: 'mock-user-id',
              ...data,
              role: data.role || 'USER',
            }
            mockDb.push(newUser)
            return newUser
          }),
        },
      },
    }
  }
)

describe('Auth API', () => {
  beforeEach(() => {
    mockDb.length = 0
  })

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      }

      const response = await request(app).post('/auth/register').send(userData)
      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('id')
      expect(response.body.email).toBe(userData.email)
      expect(response.body.role).toBe('USER')

      // Verify it was saved in "DB"
      expect(mockDb).toHaveLength(1)
    })

    it('should return 409 if email already exists', async () => {
      mockDb.push({ email: 'existing@example.com', password: 'hash' })

      const response = await request(app).post('/auth/register').send({
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      })

      expect(response.status).toBe(409)
    })
  })

  describe('POST /auth/login', () => {
    it('should return a token on valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10)
      mockDb.push({
        email: 'user@example.com',
        password: hashedPassword,
        id: '1',
        role: 'USER',
      })

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'password123' })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('token')
      expect(response.body.user).toBeDefined()
      expect(response.body.user).not.toHaveProperty('password')
    })
  })

  describe('POST /auth/logout', () => {
    it('should clear the cookie and return 200', async () => {
      const response = await request(app).post('/auth/logout')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ message: 'Logged out successfully' })

      const cookies = response.headers['set-cookie']
      expect(cookies).toBeDefined()
      expect(cookies[0]).toContain('Max-Age=0')
    })
  })
})
