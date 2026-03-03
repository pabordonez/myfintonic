import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'

// 1. Usamos vi.hoisted para crear el mock antes de que se ejecuten los imports
const { mockUse } = vi.hoisted(() => {
  return { mockUse: vi.fn() }
})

// 2. Mockeamos axios para interceptar la creación de la instancia y capturar el interceptor
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        response: {
          use: mockUse,
        },
      },
      defaults: { headers: { common: {} } },
    })),
  },
}))

// 3. Importamos el archivo a testear (esto ejecutará el código top-level y registrará el interceptor)
import '../config/api'

describe('API Interceptor Configuration', () => {
  let successInterceptor: (response: any) => any
  let errorInterceptor: (error: any) => Promise<any>

  beforeAll(() => {
    // Recuperamos la función de error (segundo argumento) pasada a interceptors.response.use
    if (mockUse.mock.calls.length > 0) {
      successInterceptor = mockUse.mock.calls[0][0]
      errorInterceptor = mockUse.mock.calls[0][1]
    }
  })

  beforeEach(() => {
    vi.clearAllMocks()
    // Mockeamos window.location
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    })

    // Espiamos localStorage
    vi.spyOn(Storage.prototype, 'removeItem')
  })

  it('should return response as is in success interceptor', () => {
    const response = { data: 'test' }
    expect(successInterceptor(response)).toBe(response)
  })

  it('NO debe redirigir al login si ocurre un 401 en /auth/login', async () => {
    const error = {
      config: { url: '/auth/login' },
      response: { status: 401 },
    }

    await expect(errorInterceptor(error)).rejects.toEqual(error)
    expect(localStorage.removeItem).not.toHaveBeenCalled()
    expect(window.location.href).not.toBe('/auth/login')
  })

  it('DEBE redirigir al login si ocurre un 401 en otros endpoints', async () => {
    const error = {
      config: { url: '/products' },
      response: { status: 401 },
    }

    await expect(errorInterceptor(error)).rejects.toEqual(error)
    expect(localStorage.removeItem).toHaveBeenCalledWith('user')
    expect(window.location.href).toBe('/auth/login')
  })

  it('NO debe redirigir si el error no tiene respuesta (error de red)', async () => {
    const error = {
      config: { url: '/products' },
      // response undefined
    }

    await expect(errorInterceptor(error)).rejects.toEqual(error)
    expect(localStorage.removeItem).not.toHaveBeenCalled()
  })

  it('NO debe redirigir si el status no es 401', async () => {
    const error = {
      config: { url: '/products' },
      response: { status: 500 },
    }

    await expect(errorInterceptor(error)).rejects.toEqual(error)
    expect(localStorage.removeItem).not.toHaveBeenCalled()
  })
})
