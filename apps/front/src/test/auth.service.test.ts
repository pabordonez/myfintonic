import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from '../features/auth/services/auth.service'
import { API_URL } from '../config/api'

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe('login', () => {
    it('should call fetch with correct parameters and return data on success', async () => {
      const mockData = { email: 'test@test.com', password: '123' }
      const mockResponse = { token: 'abc', user: { id: '1' } }

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })
      global.fetch = mockFetch

      const result = await authService.login(mockData)

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/auth/login`,
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockData),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should throw error with message from response on failure', async () => {
      const mockData = { email: 'test@test.com', password: '123' }
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Custom error' }),
      })
      global.fetch = mockFetch

      await expect(authService.login(mockData)).rejects.toThrow('Custom error')
    })

    it('should throw default error if response json fails or has no error field', async () => {
      const mockData = { email: 'test@test.com', password: '123' }
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => {
          throw new Error('JSON error')
        }, // Simula fallo al parsear JSON
      })
      global.fetch = mockFetch

      await expect(authService.login(mockData)).rejects.toThrow(
        'Credenciales inválidas'
      )
    })
  })

  describe('logout', () => {
    it('should call fetch with correct parameters and return data on success', async () => {
      const mockResponse = { message: 'Logged out' }
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })
      global.fetch = mockFetch

      const result = await authService.logout()

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/auth/logout`,
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should throw error on failure', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
      })
      global.fetch = mockFetch

      await expect(authService.logout()).rejects.toThrow(
        'Error al cerrar sesión'
      )
    })
  })
})
