import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import jwt from 'jsonwebtoken'
import { env } from '../src/config/env'

const { mockDb } = vi.hoisted(() => ({ mockDb: [] as any[] }))

vi.mock('../src/infrastructure/persistence/prisma/client', async () => {
  return {
    default: {
      clientFinancialEntity: {
        findMany: vi.fn().mockImplementation(async ({ include, where }) => {
           if (include?.client) {
             return mockDb.map(item => ({
               ...item,
               client: { id: item.clientId, email: 'test@test.com', firstName: 'Test' }
             }))
           }
           if (where?.clientId) {
             return mockDb.filter(item => item.clientId === where.clientId)
           }
           return mockDb
        }),
        create: vi.fn().mockImplementation(({ data }) => {
            const created = { id: 'new-id', ...data }
            // Simular estructura de valueHistory devuelta por Prisma (array) en lugar de la de entrada (create)
            if (data.valueHistory?.create) {
                created.valueHistory = [{
                    id: 'vh-1',
                    date: data.valueHistory.create.date || new Date(),
                    value: data.valueHistory.create.value
                }]
            } else {
                created.valueHistory = []
            }
            // Simular relación financialEntity necesaria para mapToDomain
            created.financialEntity = { id: data.financialEntityId || 'fe-1', name: 'Mock Bank' }
            
            return Promise.resolve(created)
        }),
        findFirst: vi.fn().mockImplementation(({ where }) => {
            return Promise.resolve(mockDb.find(i => i.id === where.id) || null)
        }),
        findUnique: vi.fn().mockImplementation(({ where }) => {
            return Promise.resolve(mockDb.find(i => i.id === where.id) || null)
        }),
        update: vi.fn().mockImplementation(({ where, data }) => Promise.resolve({ ...mockDb.find(i => i.id === where.id), ...data })),
        delete: vi.fn().mockResolvedValue({ id: '1' }),
      }
    }
  }
})

describe('Client Financial Entities API (Admin)', () => {
  const adminToken = jwt.sign({ id: 'admin', role: 'ADMIN' }, env.JWT_SECRET)
  const userToken = jwt.sign({ id: 'user-1', role: 'USER' }, env.JWT_SECRET)

  beforeEach(() => {
    mockDb.length = 0
    mockDb.push({
      id: '1',
      clientId: 'user-1',
      financialEntityId: 'fe-1',
      balance: 1000
    })
  })

  describe('GET /clients-financial-entities', () => {
    it('should return 403 for USER', async () => {
      const res = await request(app)
        .get('/clients-financial-entities')
        .set('Authorization', `Bearer ${userToken}`)
      
      expect(res.status).toBe(403)
    })

    it('should return 200 and list with client info for ADMIN', async () => {
      const res = await request(app)
        .get('/clients-financial-entities')
        .set('Authorization', `Bearer ${adminToken}`)
      
      expect(res.status).toBe(200)
    })
  })

  describe('Client Routes (/clients/:clientId/financial-entities)', () => {
    const baseUrl = '/clients/user-1/financial-entities'

    it('POST / should create association', async () => {
      const res = await request(app)
        .post(baseUrl)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ financialEntityId: 'fe-2', balance: 500 })
      
      expect(res.status).toBe(201)
    })

    it('GET / should list user associations', async () => {
      const res = await request(app)
        .get(baseUrl)
        .set('Authorization', `Bearer ${userToken}`)
      
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
    })

    it('GET /:id should return detail', async () => {
      const res = await request(app)
        .get(`${baseUrl}/1`)
        .set('Authorization', `Bearer ${userToken}`)
      
      expect(res.status).toBe(200)
      expect(res.body.id).toBe('1')
    })

    it('PUT /:id should update balance', async () => {
      const res = await request(app)
        .put(`${baseUrl}/1`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ balance: 2000 })
      
      expect(res.status).toBe(204)
    })

    it('DELETE /:id should delete association', async () => {
      const res = await request(app)
        .delete(`${baseUrl}/1`)
        .set('Authorization', `Bearer ${userToken}`)
      
      expect(res.status).toBe(204)
    })
  })
})