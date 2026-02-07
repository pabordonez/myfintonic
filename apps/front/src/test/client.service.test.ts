import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  updateClientProfile,
  getClients,
  getClientById,
  changePassword,
} from '../features/profile/services/client.service'

describe('client.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe('updateClientProfile', () => {
    it('should call fetch with correct parameters', async () => {
      const mockResponse = { id: '1', firstName: 'Updated', lastName: 'User' }
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })
      global.fetch = mockFetch

      const result = await updateClientProfile('1', {
        firstName: 'Updated',
        lastName: 'User',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/clients/1'),
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ firstName: 'Updated', lastName: 'User' }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should throw error on failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false })

      await expect(
        updateClientProfile('1', { firstName: 'A', lastName: 'B' })
      ).rejects.toThrow('Error al actualizar el perfil')
    })
  })

  describe('getClients', () => {
    it('should call fetch with correct parameters', async () => {
      const mockResponse = [{ id: '1', firstName: 'User' }]
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })
      global.fetch = mockFetch

      const result = await getClients()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/clients'),
        expect.objectContaining({ credentials: 'include' })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should throw error on failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false })

      await expect(getClients()).rejects.toThrow('Error al obtener clientes')
    })
  })

  describe('getClientById', () => {
    it('should call fetch with correct parameters', async () => {
      const mockResponse = { id: '1', firstName: 'User' }
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })
      global.fetch = mockFetch

      const result = await getClientById('1')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/clients/1'),
        expect.objectContaining({ credentials: 'include' })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should throw error on failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false })

      await expect(getClientById('1')).rejects.toThrow(
        'Error al obtener perfil'
      )
    })
  })

  describe('changePassword', () => {
    it('should call fetch with correct parameters', async () => {
      const mockData = { currentPassword: 'old', newPassword: 'new' }
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })
      global.fetch = mockFetch

      await changePassword('1', mockData)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/clients/1/change-password'),
        expect.objectContaining({
          method: 'PUT',
          credentials: 'include',
          body: JSON.stringify(mockData),
        })
      )
    })

    it('should throw error on failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Invalid password' }),
      })

      await expect(changePassword('1', {})).rejects.toThrow('Invalid password')
    })

    it('should throw default error if response json fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => {
          throw new Error('JSON error')
        },
      })

      await expect(changePassword('1', {})).rejects.toThrow(
        'Error al cambiar la contraseña'
      )
    })
  })
})
