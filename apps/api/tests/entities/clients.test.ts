import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { app } from '../../src/app'
import jwt from 'jsonwebtoken'
import { env } from '../../src/config/env'
import bcrypt from 'bcrypt'

// Mock Prisma
const { mockClientDb } = vi.hoisted(() => ({ mockClientDb: [] as any[] }))

vi.mock('../../src/infrastructure/persistence/prisma/client', async () => {
  return {
    default: {
      client: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          return Promise.resolve(
            mockClientDb.find((c) => c.id === where.id) || null
          )
        }),
        findMany: vi.fn().mockImplementation(() => {
          return Promise.resolve(mockClientDb)
        }),
        update: vi.fn().mockImplementation(({ where, data }) => {
          const index = mockClientDb.findIndex((c) => c.id === where.id)
          if (index !== -1) {
            mockClientDb[index] = { ...mockClientDb[index], ...data }
            return Promise.resolve(mockClientDb[index])
          }
          return Promise.reject(new Error('Record to update not found.'))
        }),
      },
    },
  }
})

describe('Client API', () => {
  const adminToken = jwt.sign({ id: 'admin-id', role: 'ADMIN' }, env.JWT_SECRET)
  const userToken = jwt.sign({ id: 'user-1', role: 'USER' }, env.JWT_SECRET)

  const hashedOldPassword = bcrypt.hashSync('oldPassword123', 10)

  beforeEach(() => {
    mockClientDb.length = 0
    mockClientDb.push({
      id: 'user-1',
      email: 'user1@test.com',
      password: hashedOldPassword,
      role: 'USER',
      firstName: 'User',
      lastName: 'One',
    })
    mockClientDb.push({
      id: 'user-2',
      email: 'user2@test.com',
      password: hashedOldPassword,
      role: 'USER',
      firstName: 'User',
      lastName: 'Two',
    })
  })

  describe('Change Password', () => {
    it('ADMIN should change password of any user without current password', async () => {
      const res = await request(app)
        .put('/clients/user-1/change-password')
        .set('Cookie', [`token=${adminToken}`])
        .send({ newPassword: 'newAdminPassword' })

      expect(res.status).toBe(204)

      // Verify in mock db
      const user = mockClientDb.find((u) => u.id === 'user-1')
      const isMatch = await bcrypt.compare('newAdminPassword', user.password)
      expect(isMatch).toBe(true)
    })

    it('USER should change their own password with correct current password', async () => {
      const res = await request(app)
        .put('/clients/user-1/change-password')
        .set('Cookie', [`token=${userToken}`])
        .send({
          currentPassword: 'oldPassword123',
          newPassword: 'newUserPassword',
        })

      expect(res.status).toBe(204)

      const user = mockClientDb.find((u) => u.id === 'user-1')
      const isMatch = await bcrypt.compare('newUserPassword', user.password)
      expect(isMatch).toBe(true)
    })

    it('USER should fail to change password without sending current password', async () => {
      const res = await request(app)
        .put('/clients/user-1/change-password')
        .set('Cookie', [`token=${userToken}`])
        .send({ newPassword: 'newUserPassword' })

      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/Current password is required/i)
    })

    it('USER should fail to change password with incorrect current password', async () => {
      const res = await request(app)
        .put('/clients/user-1/change-password')
        .set('Cookie', [`token=${userToken}`])
        .send({
          currentPassword: 'WRONGPassword',
          newPassword: 'newUserPassword',
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/Invalid current password/i)
    })

    it('USER should fail to change password of another user', async () => {
      const res = await request(app)
        .put('/clients/user-2/change-password')
        .set('Cookie', [`token=${userToken}`])
        .send({
          currentPassword: 'oldPassword123',
          newPassword: 'hackedPassword',
        })

      expect(res.status).toBe(403)
    })
  })

  describe('Get Clients', () => {
    it('ADMIN should get all clients', async () => {
      const res = await request(app)
        .get('/clients')
        .set('Cookie', [`token=${adminToken}`])

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
    })
  })

  describe('Get Client By ID', () => {
    it('USER should get their own profile', async () => {
      const res = await request(app)
        .get('/clients/user-1')
        .set('Cookie', [`token=${userToken}`])

      expect(res.status).toBe(200)
      expect(res.body.id).toBe('user-1')
    })

    it('USER should not get other profile', async () => {
      const res = await request(app)
        .get('/clients/user-2')
        .set('Cookie', [`token=${userToken}`])

      expect(res.status).toBe(403)
    })
  })

  describe('Update Client', () => {
    it('USER should update their own profile', async () => {
      const res = await request(app)
        .put('/clients/user-1')
        .set('Cookie', [`token=${userToken}`])
        .send({ firstName: 'UpdatedName' })

      expect(res.status).toBe(200)
      const user = mockClientDb.find((u) => u.id === 'user-1')
      expect(user.firstName).toBe('UpdatedName')
    })
  })
})
