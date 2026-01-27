import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

// 1. Hoisted variable to simulate in-memory DB within the mock
const { mockDb } = vi.hoisted(() => ({ mockDb: [] as any[] }))

// 2. Mock Prisma client (Infrastructure)
vi.mock('../src/infrastructure/persistence/prisma/client', async importOriginal => {
  const actual = await importOriginal()
  return {
    ...(actual as any),
    default: {
      financialProduct: {
        create: vi.fn().mockImplementation(async ({ data }) => {
          const newEntry = {
            ...data,
            // Simulate automatic DB fields
            createdAt: new Date(),
            updatedAt: new Date(),
            valueHistory: [],
            transactions: [],
          }
          // Simulate Prisma 'connect' for relations
          if (data.client?.connect?.id) {
            newEntry.clientId = data.client.connect.id
            delete newEntry.client
          }
          // Simulate Prisma 'connectOrCreate' for financialEntity relation
          if (data.financialEntity?.connectOrCreate?.create) {
            // We store the created entity object so mapToDomain can read .name from it
            newEntry.financialEntity = data.financialEntity.connectOrCreate.create
          }
          mockDb.push(newEntry)
          return newEntry
        }),
        findMany: vi.fn().mockImplementation(async ({ where }) => {
          let results = [...mockDb]
          // Basic implementation of Prisma filters
          if (where) {
            if (where.status) results = results.filter(p => p.status === where.status)
            if (where.type) results = results.filter(p => p.type === where.type)
            // Updated filter logic for relation object
            if (where.financialEntity?.name) {
              results = results.filter(p => p.financialEntity?.name === where.financialEntity.name)
            }
          }
          return results
        }),
        findUnique: vi.fn().mockImplementation(async ({ where }) => {
          return mockDb.find(p => p.id === where.id) || null
        }),
        update: vi.fn().mockImplementation(async ({ where, data }) => {
          const index = mockDb.findIndex(p => p.id === where.id)
          if (index === -1) throw new Error('Record not found')

          const current = mockDb[index]
          
          // Handle valueHistory nested write (simulation)
          const { valueHistory, ...restData } = data
          
          if (valueHistory?.create) {
            if (!current.valueHistory) current.valueHistory = []
            current.valueHistory.push({
              ...valueHistory.create,
              date: valueHistory.create.date || new Date()
            })
          }

          const updated = { ...current, ...restData }

          // Handle relation in update
          if (data.client?.connect?.id) {
            updated.clientId = data.client.connect.id
            delete updated.client
          }

          // Handle financialEntity relation in update
          if (data.financialEntity?.connectOrCreate?.create) {
            updated.financialEntity = data.financialEntity.connectOrCreate.create
          }

          mockDb[index] = updated
          return updated
        }),
        delete: vi.fn().mockImplementation(async ({ where }) => {
          const index = mockDb.findIndex(p => p.id === where.id)
          if (index === -1) throw new Error('Record not found')
          const deleted = mockDb.splice(index, 1)
          return deleted[0]
        }),
      },
      // Auxiliary mocks to avoid errors if cleanup methods are called
      productTransaction: { deleteMany: vi.fn() },
      valueHistory: { deleteMany: vi.fn() },
      client: { deleteMany: vi.fn(), create: vi.fn() },
      $disconnect: vi.fn(),
    },
  }
})

describe('Financial Products API', () => {
  // Base test data
  const baseProduct = {
    type: 'CURRENT_ACCOUNT',
    name: 'Cuenta Nómina Test',
    financialEntity: 'Banco de Pruebas',
    status: 'ACTIVE',
    clientId: '550e8400-e29b-41d4-a716-446655440000',
    currentBalance: 1000.5,
    initialBalance: 1000.5,
  }

  let productId: string

  beforeEach(async () => {
    // Clear in-memory array (simulating DB reset)
    mockDb.length = 0

    // Create a base product for tests that need it
    const response = await request(app).post('/products').send(baseProduct)
    productId = response.body?.id || 'dummy-id'
  })

  describe('GET /products', () => {
    it('should return 200 and a list of products', async () => {
      const response = await request(app).get('/products')
      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })

    it('should allow filtering by status', async () => {
      // Create an inactive product to test filtering
      const inactiveProduct = { ...baseProduct, status: 'INACTIVE', name: 'Inactive Product' }
      await request(app).post('/products').send(inactiveProduct)

      const response = await request(app).get('/products?status=INACTIVE')
      expect(response.status).toBe(200)
      expect(response.body.length).toBeGreaterThan(0)
      expect(response.body.every((p: any) => p.status === 'INACTIVE')).toBe(true)
    })

    it('should allow filtering by type', async () => {
      const investmentFund = {
        ...baseProduct,
        type: 'INVESTMENT_FUND',
        name: 'My Fund',
        numberOfUnits: 50,
        netAssetValue: 200,
        totalPurchaseValue: 10000,
        fees: { opening: 0, closing: 0, maintenance: 10 },
      }
      await request(app).post('/products').send(investmentFund)

      const response = await request(app).get('/products?type=INVESTMENT_FUND')
      expect(response.status).toBe(200)
      expect(response.body.length).toBeGreaterThan(0)
      expect(response.body.every((p: any) => p.type === 'INVESTMENT_FUND')).toBe(true)
    })

    it('should allow filtering by financialEntity', async () => {
      const otherBankProduct = {
        ...baseProduct,
        financialEntity: 'Global Bank',
        name: 'Global Account',
      }
      await request(app).post('/products').send(otherBankProduct)

      const response = await request(app).get('/products?financialEntity=Global Bank')
      expect(response.status).toBe(200)
      expect(response.body.length).toBeGreaterThan(0)
      expect(response.body.every((p: any) => p.financialEntity === 'Global Bank')).toBe(true)
    })
  })

  describe('POST /products', () => {
    it('should return 201 and the created product on valid input', async () => {
      const response = await request(app).post('/products').send(baseProduct)

      expect(response.status).toBe(201)
      expect(response.body).toMatchObject(baseProduct)
      expect(response.body).toHaveProperty('id')
    })

    it('should return 400 on invalid input (missing required fields)', async () => {
      const invalidProduct = { name: 'Incomplete Product' }
      const response = await request(app).post('/products').send(invalidProduct)

      expect(response.status).toBe(400)
    })
  })

  describe('GET /products/:id', () => {
    it('should return 200 and the product if found', async () => {
      const response = await request(app).get(`/products/${productId}`)

      // In the initial TDD phase, this will fail with 404
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('id', productId)
    })

    it('should return 404 if product not found', async () => {
      const response = await request(app).get('/products/non-existent-id')
      expect(response.status).toBe(404)
    })
  })

  describe('PUT /products/:id', () => {
    it('should return 204 on successful update', async () => {
      const updatedProduct = { ...baseProduct, name: 'Updated Name' }
      const response = await request(app).put(`/products/${productId}`).send(updatedProduct)

      expect(response.status).toBe(204)
    })

    it('should update balance and create history entry with previousValue', async () => {
      const newBalance = 1500.0
      const response = await request(app).put(`/products/${productId}`).send({ currentBalance: newBalance })

      expect(response.status).toBe(204)

      // Verify history via GET
      const getResponse = await request(app).get(`/products/${productId}`)
      expect(Number(getResponse.body.currentBalance)).toBe(newBalance)
      expect(getResponse.body.valueHistory).toHaveLength(1)
      expect(Number(getResponse.body.valueHistory[0].value)).toBe(newBalance)
      expect(Number(getResponse.body.valueHistory[0].previousValue)).toBe(baseProduct.currentBalance)
    })
  })

  describe('PATCH /products/:id', () => {
    it('should return 204 and update status', async () => {
      const response = await request(app).patch(`/products/${productId}`).send({ status: 'PAUSED' })

      expect(response.status).toBe(204)

      const getResponse = await request(app).get(`/products/${productId}`)
      expect(getResponse.body.status).toBe('PAUSED')
    })

    it('should return 404 if product not found', async () => {
      const response = await request(app)
        .patch('/products/non-existent-id')
        .send({ status: 'PAUSED' })
      expect(response.status).toBe(404)
    })
  })

  describe('DELETE /products/:id', () => {
    it('should return 204 and disappear from queries', async () => {
      // 1. Borrar
      const response = await request(app).delete(`/products/${productId}`)
      expect(response.status).toBe(204)

      // 2. Verificar que el detalle da 404
      const getResponse = await request(app).get(`/products/${productId}`)
      expect(getResponse.status).toBe(404)

      // 3. Verificar que no sale en el listado
      const listResponse = await request(app).get('/products')
      const found = listResponse.body.find((p: any) => p.id === productId)
      expect(found).toBeUndefined()
    })
  })
})
