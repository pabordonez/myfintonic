import { describe, it, expect, vi, beforeEach } from 'vitest'
import { productService } from '../features/products/services/product.service'
import { api } from '../config/api'

vi.mock('../config/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  },
}))

describe('product.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getAll calls api.get', async () => {
    const mockData = [{ id: '1', name: 'P1', type: 'TYPE' }]
    vi.mocked(api.get).mockResolvedValue({ data: mockData })
    const result = await productService.getAll()
    expect(api.get).toHaveBeenCalledWith('/products')
    expect(result).toEqual(mockData)
  })

  it('getById calls api.get', async () => {
    const mockData = { id: '1', name: 'P1', type: 'TYPE' }
    vi.mocked(api.get).mockResolvedValue({ data: mockData })
    const result = await productService.getById('1')
    expect(api.get).toHaveBeenCalledWith('/products/1')
    expect(result).toEqual(mockData)
  })

  it('create calls api.post', async () => {
    const mockData = { name: 'New', type: 'TYPE' }
    vi.mocked(api.post).mockResolvedValue({ data: { id: '1', ...mockData } })
    const result = await productService.create(mockData)
    expect(api.post).toHaveBeenCalledWith('/products', mockData)
    expect(result).toEqual({ id: '1', ...mockData })
  })

  it('update calls api.put', async () => {
    const mockData = { id: '1', name: 'Updated', type: 'TYPE' }
    vi.mocked(api.put).mockResolvedValue({ data: mockData })
    const result = await productService.update('1', mockData)
    expect(api.put).toHaveBeenCalledWith('/products/1', mockData)
    expect(result).toEqual(mockData)
  })

  it('delete calls api.delete', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: {} })
    await productService.delete('1')
    expect(api.delete).toHaveBeenCalledWith('/products/1')
  })

  it('getAll handles string numbers and nulls correctly via Zod coercion', async () => {
    const mockData = [
      {
        id: '1',
        name: 'P1',
        type: 'CURRENT_ACCOUNT',
        currentBalance: '100.50', // String que debe ser convertido
        initialBalance: null, // Null que debe mantenerse o ser undefined
        numberOfUnits: '', // String vacío que debe ser undefined
      },
    ]
    vi.mocked(api.get).mockResolvedValue({ data: mockData })
    const result = await productService.getAll()

    expect(result[0].currentBalance).toBe(100.5)
    expect(result[0].initialBalance).toBeNull()
    expect(result[0].numberOfUnits).toBeUndefined()
  })
})
