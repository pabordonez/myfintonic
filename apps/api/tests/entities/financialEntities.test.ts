import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { app } from '../../src/app'
import jwt from 'jsonwebtoken'
import { env } from '../../src/config/env'

// 1. Hoisted variable to simulate the catalog in-memory
const { mockCatalog } = vi.hoisted(() => ({
  mockCatalog: [] as any[],
}))

// 2. Mock Prisma client (Infrastructure)
vi.mock(
  '../../src/infrastructure/persistence/prisma/client',
  async (importOriginal) => {
    const actual = await importOriginal()
    return {
      ...(actual as any),
      default: {
        financialEntity: {
          create: vi.fn().mockImplementation(async ({ data }) => {
            if (data.name === 'Error Bank') {
              throw new Error('Simulated DB Error')
            }
            const newEntry = {
              id: `catalog-${Math.random()}`,
              name: data.name,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            mockCatalog.push(newEntry)
            return newEntry
          }),
          findMany: vi.fn().mockImplementation(async ({ where }) => {
            return mockCatalog.filter(
              (e) => (!where?.name || e.name === where.name) && !e.deletedAt
            )
          }),
          findUnique: vi.fn().mockImplementation(async ({ where }) => {
            const found = mockCatalog.find((e) => e.id === where.id)
            return found && !found.deletedAt ? found : null
          }),
          update: vi.fn().mockImplementation(async ({ where, data }) => {
            const index = mockCatalog.findIndex((e) => e.id === where.id)
            if (index === -1) throw new Error('Record not found')
            const updated = { ...mockCatalog[index], ...data }
            mockCatalog[index] = updated
            return updated
          }),
          delete: vi.fn().mockImplementation(async ({ where }) => {
            const index = mockCatalog.findIndex((e) => e.id === where.id)
            if (index === -1) throw new Error('Record not found')
            const deleted = mockCatalog.splice(index, 1)
            return deleted[0]
          }),
        },
        $disconnect: vi.fn(),
      },
    }
  }
)

describe('Financial Entities Catalog API', () => {
  const baseEntity = {
    name: 'Banco Santander',
  }

  let entityId: string
  const adminToken = jwt.sign({ id: 'admin', role: 'ADMIN' }, env.JWT_SECRET)
  const userToken = jwt.sign({ id: 'user', role: 'USER' }, env.JWT_SECRET)

  beforeEach(async () => {
    mockCatalog.length = 0
    const response = await request(app)
      .post('/financial-entities')
      .set('Cookie', [`token=${adminToken}`])
      .send(baseEntity)
    entityId = response.body?.id
  })

  describe('POST /financial-entities', () => {
    it('should create a new financial entity in the catalog', async () => {
      const newEntity = { ...baseEntity, name: 'BBVA' }
      const response = await request(app)
        .post('/financial-entities')
        .set('Cookie', [`token=${adminToken}`])
        .send(newEntity)
      expect(response.status).toBe(201)
      expect(response.body.name).toBe('BBVA')
    })

    it('should return 403 if USER tries to create (BFLA Protection)', async () => {
      const newEntity = { ...baseEntity, name: 'Hacker Bank' }
      const response = await request(app)
        .post('/financial-entities')
        .set('Cookie', [`token=${userToken}`])
        .send(newEntity)
      expect(response.status).toBe(403)
    })

    it('should return 500 and log error if creation fails', async () => {
      const response = await request(app)
        .post('/financial-entities')
        .set('Cookie', [`token=${adminToken}`])
        .send({ name: 'Error Bank' })
      expect(response.status).toBe(500)
    })
  })

  describe('GET /financial-entities', () => {
    it('should return all entities from the catalog', async () => {
      const response = await request(app)
        .get('/financial-entities')
        .set('Cookie', [`token=${userToken}`])
      expect(response.status).toBe(200)
      expect(response.body.length).toBeGreaterThan(0)
      expect(response.body[0]).toHaveProperty('name', 'Banco Santander')
    })
  })

  describe('DELETE /financial-entities/:id', () => {
    it('should delete an entity and ensure it does not appear in queries', async () => {
      // 1. Borrar
      const response = await request(app)
        .delete(`/financial-entities/${entityId}`)
        .set('Cookie', [`token=${adminToken}`])
      expect(response.status).toBe(204)

      // 2. Verificar que ya no aparece en el detalle (404)
      const getResponse = await request(app)
        .get(`/financial-entities/${entityId}`)
        .set('Cookie', [`token=${userToken}`])
      expect(getResponse.status).toBe(404)

      // 3. Verificar que ya no aparece en el listado
      const listResponse = await request(app)
        .get('/financial-entities')
        .set('Cookie', [`token=${userToken}`])
      const found = listResponse.body.find((e: any) => e.id === entityId)
      expect(found).toBeUndefined()
    })

    it('should return 403 if USER tries to delete (BFLA Protection)', async () => {
      const response = await request(app)
        .delete(`/financial-entities/${entityId}`)
        .set('Cookie', [`token=${userToken}`])
      expect(response.status).toBe(403)
    })
  })
})
