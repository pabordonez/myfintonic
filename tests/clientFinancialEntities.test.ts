import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import prisma from '../src/infrastructure/persistence/prisma/client'
import jwt from 'jsonwebtoken'
import { env } from '../src/config/env'

// 1. Hoisted variables to simulate in-memory DBs within the mock
const { mockDb, mockCatalog } = vi.hoisted(() => ({
  mockDb: [] as any[],
  mockCatalog: [] as any[],
}))

// 2. Mock Prisma client (Infrastructure)
vi.mock('../src/infrastructure/persistence/prisma/client', () => {
  return {
    default: {
      financialEntity: {
        findUnique: vi.fn().mockImplementation(async ({ where }) => {
          return mockCatalog.find(e => e.name === (where as any).name) || null
        }),
      },
      clientFinancialEntity: {
        create: vi.fn().mockImplementation(async ({ data }) => {
          // Simular restricción de unicidad (P2002)
          const existing = mockDb.find(e => e.clientId === data.clientId && e.financialEntityId === data.financialEntityId)
          if (existing) {
            const error: any = new Error('Unique constraint failed')
            error.code = 'P2002'
            throw error
          }

          const catalogEntity = mockCatalog.find(e => e.id === data.financialEntityId)
          
          if (!catalogEntity) {
            throw new Error('Financial Entity not found')
          }

          const newEntry = {
            id: `cfe-${Math.random()}`,
            balance: data.balance,
            initialBalance: data.initialBalance || data.balance,
            clientId: data.clientId,
            financialEntityId: data.financialEntityId,
            financialEntity: catalogEntity,
            createdAt: new Date(),
            updatedAt: new Date(),
            valueHistory: [],
          }
          mockDb.push(newEntry)
          return newEntry
        }),
        findUnique: vi.fn().mockImplementation(async ({ where }) => {
          if (where.clientId_financialEntityId) {
             return mockDb.find(e => 
               e.clientId === where.clientId_financialEntityId.clientId && 
               e.financialEntityId === where.clientId_financialEntityId.financialEntityId &&
               !e.deletedAt
             ) || null
          }
          return mockDb.find(e => e.id === where.id && !e.deletedAt) || null
        }),
        findFirst: vi.fn().mockImplementation(async ({ where }) => {
          if (where.clientId && where.financialEntityId) {
            return mockDb.find(e => 
              e.clientId === where.clientId && 
              e.financialEntityId === where.financialEntityId && 
              !e.deletedAt
            ) || null
          }
          return mockDb.find(p => p.id === where.id && !p.deletedAt) || null
        }),
        findMany: vi.fn().mockImplementation(async ({ where }) => {
          return mockDb.filter(e => e.clientId === where.clientId && !e.deletedAt)
        }),
        update: vi.fn().mockImplementation(async ({ where, data }) => {
          let index = -1
          if (where.id) {
            index = mockDb.findIndex(e => e.id === where.id)
          } else if (where.clientId_financialEntityId) {
            // Soporte para búsqueda por clave compuesta (usado en upsert/restore)
            index = mockDb.findIndex(e => 
              e.clientId === where.clientId_financialEntityId.clientId && 
              e.financialEntityId === where.clientId_financialEntityId.financialEntityId
            )
          }

          if (index === -1) throw new Error('Record not found')

          const current = mockDb[index]
          const cleanData = { ...data }
          
          // Simular creación de histórico anidado
          if (cleanData.valueHistory?.create) {
            if (!current.valueHistory) current.valueHistory = []
            current.valueHistory.push({
              id: `vh-${Math.random()}`,
              ...cleanData.valueHistory.create,
              date: cleanData.valueHistory.create.date || new Date()
            })
            delete cleanData.valueHistory
          }

          const updated = { ...current, ...cleanData }
          
          // Manejo explícito de restauración (deletedAt: null)
          if (data.deletedAt === null) updated.deletedAt = null

          mockDb[index] = updated
          return updated
        }),
        delete: vi.fn().mockImplementation(async ({ where }) => {
          const index = mockDb.findIndex(e => e.id === where.id)
          if (index === -1) throw new Error('Record not found')
          // Simular Soft Delete
          mockDb[index].deletedAt = new Date()
          return mockDb[index]
        }),
      },
      $disconnect: vi.fn(),
    },
  }
})

describe('Client Financial Entity Association API', () => {
  const clientId = 'client-123'
  const santanderId = 'catalog-santander'

  // Tokens
  const userToken = jwt.sign({ id: clientId, role: 'USER' }, env.JWT_SECRET)
  const otherUserToken = jwt.sign({ id: 'other-client', role: 'USER' }, env.JWT_SECRET)
  const adminToken = jwt.sign({ id: 'admin', role: 'ADMIN' }, env.JWT_SECRET)

  beforeEach(() => {
    mockDb.length = 0
    mockCatalog.length = 0

    // Pre-populate catalog
    mockCatalog.push({
      id: santanderId,
      name: 'Banco Santander',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  })

  describe('POST /clients/:clientId/financial-entities', () => {
    it('should create a new association for a client', async () => {
      const response = await request(app)
        .post(`/clients/${clientId}/financial-entities`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          financialEntityId: santanderId,
          balance: 5000,
          initialBalance: 5000,
        })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('clientId', clientId)
      expect(response.body).toHaveProperty('financialEntityId', santanderId)
      expect(response.body.balance).toBe(5000)
      expect(response.body.initialBalance).toBe(5000)
    })

    it('should return 409 if association already exists and is ACTIVE', async () => {
      // 1. Crear primera vez
      await request(app)
        .post(`/clients/${clientId}/financial-entities`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ financialEntityId: santanderId, balance: 5000 })

      // 2. Intentar crear de nuevo (debe fallar)
      const response = await request(app)
        .post(`/clients/${clientId}/financial-entities`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ financialEntityId: santanderId, balance: 1000 })

      expect(response.status).toBe(409)
      expect(response.body.error).toBe('Association already exists')
    })

    it('should return 404 if the financial entity does not exist in catalog', async () => {
      const response = await request(app)
        .post(`/clients/${clientId}/financial-entities`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          financialEntityId: 'non-existent-id',
          balance: 5000,
        })

      expect(response.status).toBe(404)
    })

    it('should return 403 if user tries to create association for another client', async () => {
      const response = await request(app)
        .post(`/clients/${clientId}/financial-entities`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          financialEntityId: santanderId,
        })
      expect(response.status).toBe(403)
    })

    it('should allow ADMIN to create association for any client', async () => {
      const response = await request(app)
        .post(`/clients/${clientId}/financial-entities`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          financialEntityId: santanderId,
          balance: 5000,
          initialBalance: 5000,
        })
      expect(response.status).toBe(201)
    })

    it('should restore (reactivate) a deleted association if created again', async () => {
      // 1. Crear
      const createRes = await request(app)
        .post(`/clients/${clientId}/financial-entities`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ financialEntityId: santanderId, balance: 1000 })
      const id = createRes.body.id

      // 2. Borrar (Soft Delete)
      await request(app).delete(`/clients/${clientId}/financial-entities/${id}`).set('Authorization', `Bearer ${userToken}`)
      
      // 3. Crear de nuevo (Debe restaurar)
      const response = await request(app)
        .post(`/clients/${clientId}/financial-entities`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ financialEntityId: santanderId, balance: 2000 })

      expect(response.status).toBe(201)
      expect(response.body.id).toBe(id) // Debe ser el mismo ID recuperado
      expect(response.body.balance).toBe(2000) // Saldo actualizado
      
      // Verificar en "BD" que ya no está borrado
      const inDb = mockDb.find(e => e.id === id)
      expect(inDb.deletedAt).toBeNull()
      expect(Number(inDb.balance)).toBe(2000)
    })
  })

  describe('PUT /clients/:clientId/financial-entities/:id', () => {
    it('should update the balance and create a history entry', async () => {
      // First, create an association to update
      const createRes = await request(app)
        .post(`/clients/${clientId}/financial-entities`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ financialEntityId: santanderId, balance: 5000 })
      const associationId = createRes.body.id

      // Now, update it
      const updateResponse = await request(app)
        .put(`/clients/${clientId}/financial-entities/${associationId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ balance: 7500 })

      expect(updateResponse.status).toBe(204)

      // Verify history creation was requested in Prisma
      expect(prisma.clientFinancialEntity.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            valueHistory: expect.objectContaining({
              create: expect.objectContaining({
                value: expect.anything(),
              }),
            }),
          }),
        })
      )
    })
  })

  describe('DELETE /clients/:clientId/financial-entities/:id', () => {
    it('should delete the association and not return it afterwards', async () => {
      // Setup: Crear una vinculación para borrar
      const createRes = await request(app)
        .post(`/clients/${clientId}/financial-entities`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ financialEntityId: santanderId, balance: 1000 })
      const id = createRes.body.id

      // 1. Borrar
      const deleteRes = await request(app).delete(`/clients/${clientId}/financial-entities/${id}`).set('Authorization', `Bearer ${userToken}`)
      expect(deleteRes.status).toBe(204)

      // 2. Verificar detalle 404
      const getRes = await request(app).get(`/clients/${clientId}/financial-entities/${id}`).set('Authorization', `Bearer ${userToken}`)
      expect(getRes.status).toBe(404)

      // 3. Verificar que no está en la lista del cliente
      const listRes = await request(app).get(`/clients/${clientId}/financial-entities`).set('Authorization', `Bearer ${userToken}`)
      const found = listRes.body.find((e: any) => e.id === id)
      expect(found).toBeUndefined()
    })
  })
})