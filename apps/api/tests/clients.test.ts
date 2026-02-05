import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import jwt from 'jsonwebtoken'
import { env } from '../src/config/env'

// Mock Prisma
const { mockDb } = vi.hoisted(() => ({ mockDb: [] as any[] }))

vi.mock('../src/infrastructure/persistence/prisma/client', async () => {
  return {
    default: {
      client: {
        findMany: vi.fn().mockResolvedValue(mockDb),
        findUnique: vi.fn().mockImplementation(async ({ where }) => {
          return mockDb.find(c => c.id === where.id) || null
        }),
        update: vi.fn().mockImplementation(async ({ where, data }) => {
          const index = mockDb.findIndex(c => c.id === where.id)
          if (index === -1) throw new Error('Not found')
          mockDb[index] = { ...mockDb[index], ...data }
          return mockDb[index]
        })
      }
    }
  }
})

describe('Clients API', () => {
  const adminToken = jwt.sign({ id: 'admin', role: 'ADMIN' }, env.JWT_SECRET)
  const userToken = jwt.sign({ id: 'user-1', role: 'USER' }, env.JWT_SECRET)

  beforeEach(() => {
    mockDb.length = 0
    mockDb.push({ id: 'user-1', email: 'user@test.com', role: 'USER', firstName: 'User' })
    mockDb.push({ id: 'admin', email: 'admin@test.com', role: 'ADMIN', firstName: 'Admin' })
  })

  describe('GET /clients', () => {
    it('should return all clients for ADMIN', async () => {
      const res = await request(app)
        .get('/clients')
        .set('Authorization', `Bearer ${adminToken}`)
      
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
    })

    it('should return 403 for USER', async () => {
      const res = await request(app)
        .get('/clients')
        .set('Authorization', `Bearer ${userToken}`)
      
      expect(res.status).toBe(403)
    })
  })

  describe('GET /clients/:id', () => {
    it('should return client details for ADMIN', async () => {
      const res = await request(app)
        .get('/clients/user-1')
        .set('Authorization', `Bearer ${adminToken}`)
      
      expect(res.status).toBe(200)
      expect(res.body.id).toBe('user-1')
    })
  })

  describe('PUT /clients/:id', () => {
    it('should update own details', async () => {
      const res = await request(app)
        .put('/clients/user-1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ firstName: 'Updated' })
      
      expect(res.status).toBe(200)
      expect(res.body.firstName).toBe('Updated')
    })
  })
})