import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import prisma from '../src/infrastructure/persistence/prisma/client'

// 1. Hoisted variable to simulate in-memory DB within the mock
const { mockDb } = vi.hoisted(() => ({ mockDb: [] as any[] }))

// 2. Mock Prisma client (Infrastructure)
vi.mock('../src/infrastructure/persistence/prisma/client', async importOriginal => {
  const actual = await importOriginal()
  return {
    ...(actual as any),
    default: {
      financialEntity: {
        create: vi.fn().mockImplementation(async ({ data }) => {
          const newEntry = {
            ...data,
            id: 'fe-123',
            createdAt: new Date(),
            updatedAt: new Date(),
            // Handle Decimal conversion simulation if needed, or keep as is
            balance: data.balance,
          }
          // Simulate Prisma 'connect' for relations
          if (data.client?.connect?.id) {
            newEntry.clientId = data.client.connect.id
            delete newEntry.client
          }
          mockDb.push(newEntry)
          return newEntry
        }),
        findMany: vi.fn().mockImplementation(async ({ where }) => {
          let results = [...mockDb]
          if (where) {
            if (where.clientId) results = results.filter(e => e.clientId === where.clientId)
            if (where.name) results = results.filter(e => e.name === where.name)
          }
          return results
        }),
        findUnique: vi.fn().mockImplementation(async ({ where }) => {
          return mockDb.find(e => e.id === where.id) || null
        }),
        update: vi.fn().mockImplementation(async ({ where, data }) => {
          const index = mockDb.findIndex(e => e.id === where.id)
          if (index === -1) throw new Error('Record not found')

          const current = mockDb[index]

          // Clean up nested writes (valueHistory) for the mock DB representation
          const cleanData = { ...data }
          delete cleanData.valueHistory

          const updated = { ...current, ...cleanData }
          mockDb[index] = updated
          return updated
        }),
        delete: vi.fn().mockImplementation(async ({ where }) => {
          const index = mockDb.findIndex(e => e.id === where.id)
          if (index === -1) throw new Error('Record not found')
          const deleted = mockDb.splice(index, 1)
          return deleted[0]
        }),
      },
      $disconnect: vi.fn(),
    },
  }
})

describe('Financial Entities API', () => {
  const baseEntity = {
    name: 'Banco Santander',
    balance: 15000.5,
    clientId: '550e8400-e29b-41d4-a716-446655440000',
  }

  let entityId: string

  beforeEach(async () => {
    mockDb.length = 0
    const response = await request(app).post('/financial-entities').send(baseEntity)
    entityId = response.body?.id || 'fe-123'
  })

  describe('POST /financial-entities', () => {
    it('should create a new financial entity', async () => {
      const newEntity = { ...baseEntity, name: 'BBVA' }
      const response = await request(app).post('/financial-entities').send(newEntity)
      expect(response.status).toBe(201)
      expect(response.body.name).toBe('BBVA')
    })
  })

  describe('GET /financial-entities', () => {
    it('should return all entities', async () => {
      const response = await request(app).get('/financial-entities')
      expect(response.status).toBe(200)
      expect(response.body.length).toBeGreaterThan(0)
    })

    it('should filter by name', async () => {
      const response = await request(app).get('/financial-entities?name=Banco Santander')
      expect(response.status).toBe(200)
      expect(response.body[0].name).toBe('Banco Santander')
    })
  })

  describe('PUT /financial-entities/:id', () => {
    it('should update entity balance and create history entry', async () => {
      const updatedData = { name: 'Banco Santander Updated', balance: 20000.0 }
      const response = await request(app).put(`/financial-entities/${entityId}`).send(updatedData)

      expect(response.status).toBe(204)

      // Verify update via GET
      const getResponse = await request(app).get(`/financial-entities/${entityId}`)
      expect(getResponse.body.name).toBe('Banco Santander Updated')
      // Note: In a real DB with Decimal, this might come back as string or number depending on config,
      // but our mock passes it through.

      // Verify history creation was requested in Prisma
      expect(prisma.financialEntity.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            valueHistory: expect.objectContaining({
              create: expect.objectContaining({
                value: expect.anything(), // In real exec it's a Decimal
              }),
            }),
          }),
        })
      )
    })
  })

  describe('DELETE /financial-entities/:id', () => {
    it('should delete an entity', async () => {
      const response = await request(app).delete(`/financial-entities/${entityId}`)
      expect(response.status).toBe(204)
    })
  })
})
