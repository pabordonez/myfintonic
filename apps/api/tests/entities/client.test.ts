import { describe, it, expect } from 'vitest'
import { Client } from '../../src/domain/models/client'

describe('Client Domain Model', () => {
  describe('create', () => {
    it('should throw if email is missing', () => {
      expect(() => Client.create({ password: '123' } as any, '1')).toThrow(
        'Email is required'
      )
    })
    it('should throw if password is missing', () => {
      expect(() => Client.create({ email: 'a@b.c' } as any, '1')).toThrow(
        'Password is required'
      )
    })
  })

  describe('update', () => {
    it('should update fields correctly', () => {
      const client = Client.create(
        {
          email: 'a@b.c',
          password: '123',
          firstName: 'A',
          lastName: 'B',
          role: 'USER',
        },
        '1'
      )
      const oldUpdatedAt = client.updatedAt

      client.update({
        firstName: 'New',
        lastName: 'New',
        nickname: 'Nick',
        email: 'new@b.c',
        password: '456',
      })

      expect(client.firstName).toBe('New')
      expect(client.lastName).toBe('New')
      expect(client.nickname).toBe('Nick')
      expect(client.email).toBe('new@b.c')
      expect(client.password).toBe('456')
      expect(client.updatedAt).not.toBe(oldUpdatedAt)
    })
  })
})
