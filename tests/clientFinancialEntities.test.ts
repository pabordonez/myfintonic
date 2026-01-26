import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import prisma from '../src/infrastructure/persistence/prisma/client'

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
          return mockDb.find(e => e.id === where.id) || null
        }),
        update: vi.fn().mockImplementation(async ({ where, data }) => {
          const index = mockDb.findIndex(e => e.id === where.id)
          if (index === -1) throw new Error('Record not found')

          const current = mockDb[index]
          const cleanData = { ...data }
          delete cleanData.valueHistory

          const updated = { ...current, ...cleanData }
          mockDb[index] = updated
          return updated
        }),
      },
      $disconnect: vi.fn(),
    },
  }
})

describe('Client Financial Entity Association API', () => {
  const clientId = 'client-123'
  const santanderId = 'catalog-santander'

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

  describe('POST /financial-entities/:id/client', () => {
    it('should create a new association for a client', async () => {
      const response = await request(app)
        .post(`/financial-entities/${santanderId}/client`)
        .send({
          clientId: clientId,
          balance: 5000,
          initialBalance: 5000,
        })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('clientId', clientId)
      expect(response.body).toHaveProperty('financialEntityId', santanderId)
      expect(response.body.balance).toBe(5000)
      expect(response.body.initialBalance).toBe(5000)
    })

    it('should return 404 if the financial entity does not exist in catalog', async () => {
      const response = await request(app)
        .post('/financial-entities/non-existent-id/client')
        .send({
          clientId: clientId,
          balance: 5000,
        })

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /financial-entities/:id/client/:associationId', () => {
    it('should update the balance and create a history entry', async () => {
      // First, create an association to update
      const createRes = await request(app)
        .post(`/financial-entities/${santanderId}/client`)
        .send({ clientId: clientId, balance: 5000 })
      const associationId = createRes.body.id

      // Now, update it
      const updateResponse = await request(app)
        .put(`/financial-entities/${santanderId}/client/${associationId}`)
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
})