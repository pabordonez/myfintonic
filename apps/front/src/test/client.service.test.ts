import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateClientProfile } from '../features/profile/services/client.service'

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

      const result = await updateClientProfile('1', { firstName: 'Updated', lastName: 'User' }, 'token')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/clients/1'),
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer token',
          },
          body: JSON.stringify({ firstName: 'Updated', lastName: 'User' }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should throw error on failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false })

      await expect(updateClientProfile('1', { firstName: 'A', lastName: 'B' }, 'token'))
        .rejects.toThrow('Error al actualizar el perfil')
    })
  })
})