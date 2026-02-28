import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  updateClientProfile,
  getClients,
  getClientById,
  changePassword,
} from '../features/profile/services/client.service'
import { api } from '../config/api'

vi.mock('../config/api', () => ({
  api: {
    get: vi.fn(),
    put: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  },
  API_URL: 'http://localhost:3000',
}))

describe('client.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('updateClientProfile', () => {
    it('should call api.put with correct parameters', async () => {
      const mockResponse = { id: '1', firstName: 'Updated', lastName: 'User' }
      const payload = { firstName: 'Updated', lastName: 'User' }
      vi.mocked(api.put).mockResolvedValue({ data: mockResponse })

      const result = await updateClientProfile('1', payload)

      expect(api.put).toHaveBeenCalledWith('/clients/1', payload)
      expect(result).toEqual(mockResponse)
    })

    it('should throw error on failure', async () => {
      vi.mocked(api.put).mockRejectedValue(new Error('API Error'))

      await expect(
        updateClientProfile('1', { firstName: 'A', lastName: 'B' })
      ).rejects.toThrow('API Error')
    })
  })

  describe('getClients', () => {
    it('should call api.get with correct parameters', async () => {
      const mockResponse = [{ id: '1', firstName: 'User' }]
      vi.mocked(api.get).mockResolvedValue({ data: mockResponse })

      const result = await getClients()

      expect(api.get).toHaveBeenCalledWith('/clients')
      expect(result).toEqual(mockResponse)
    })

    it('should throw error on failure', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('API Error'))

      await expect(getClients()).rejects.toThrow('API Error')
    })
  })

  describe('getClientById', () => {
    it('should call api.get with correct parameters', async () => {
      const mockResponse = { id: '1', firstName: 'User' }
      vi.mocked(api.get).mockResolvedValue({ data: mockResponse })

      const result = await getClientById('1')

      expect(api.get).toHaveBeenCalledWith('/clients/1')
      expect(result).toEqual(mockResponse)
    })

    it('should throw error on failure', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('API Error'))

      await expect(getClientById('1')).rejects.toThrow('API Error')
    })
  })

  describe('changePassword', () => {
    it('should call api.put with correct parameters', async () => {
      const mockData = { currentPassword: 'old', newPassword: 'new' }
      vi.mocked(api.put).mockResolvedValue({ data: {} })

      await changePassword('1', mockData)

      expect(api.put).toHaveBeenCalledWith(
        '/clients/1/change-password',
        mockData
      )
    })

    it('should throw error on failure', async () => {
      vi.mocked(api.put).mockRejectedValue({
        response: { data: { error: 'Invalid password' } },
      })

      await expect(changePassword('1', {})).rejects.toThrow('Invalid password')
    })
  })
})
