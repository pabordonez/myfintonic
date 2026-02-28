import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from '../features/auth/services/auth.service'
import { api } from '../config/api'

// Mockeamos la instancia de api en lugar de fetch
vi.mock('../config/api', () => ({
  api: {
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  },
}))

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should call api.post with correct parameters and return data on success', async () => {
      const mockData = { email: 'test@test.com', password: '123' }
      const mockResponse = { token: 'abc', user: { id: '1' } }

      // Simulamos respuesta exitosa de axios
      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await authService.login(mockData)

      expect(api.post).toHaveBeenCalledWith('/auth/login', mockData)
      expect(result).toEqual(mockResponse)
    })

    it('should throw error with message from response on failure', async () => {
      const mockData = { email: 'test@test.com', password: '123' }

      // Simulamos error de axios con la estructura que espera tu servicio
      vi.mocked(api.post).mockRejectedValue({
        response: { data: { error: 'Custom error' } },
      })

      await expect(authService.login(mockData)).rejects.toThrow('Custom error')
    })

    it('should throw default error if response json fails or has no error field', async () => {
      const mockData = { email: 'test@test.com', password: '123' }

      // Simulamos un error genérico (ej. error de red sin respuesta del servidor)
      vi.mocked(api.post).mockRejectedValue(new Error('Network Error'))

      await expect(authService.login(mockData)).rejects.toThrow(
        'Credenciales inválidas'
      )
    })
  })

  describe('logout', () => {
    it('should call api.post and return data on success', async () => {
      const mockResponse = { message: 'Logged out' }
      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await authService.logout()

      expect(api.post).toHaveBeenCalledWith('/auth/logout')
      expect(result).toEqual(mockResponse)
    })

    it('should propagate error on failure', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('Network Error'))

      await expect(authService.logout()).rejects.toThrow('Network Error')
    })
  })
})
