import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  updateClientProfile,
  getClients,
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
})
