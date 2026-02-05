import { describe, it, expect, vi, beforeEach } from 'vitest'
import { productService } from '../features/products/services/product.service'
import axios from 'axios'
import { API_URL } from '../config/api'

// Mock axios with a factory to handle instances created via axios.create()
vi.mock('axios', () => {
  const mockAxios = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    create: vi.fn().mockReturnThis(),
    defaults: { headers: { common: {} } },
    isAxiosError: vi.fn(),
  }
  return { default: mockAxios }
})

describe('product.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('token', 'test-token')
  })

  it('getAll calls axios.get', async () => {
    const mockData = [{ id: 1 }]
    vi.mocked(axios.get).mockResolvedValue({ data: mockData })
    const result = await productService.getAll()
    expect(axios.get).toHaveBeenCalledWith(`${API_URL}/products`, expect.any(Object))
    expect(result).toEqual(mockData)
  })

  it('getById calls axios.get', async () => {
    const mockData = { id: 1 }
    vi.mocked(axios.get).mockResolvedValue({ data: mockData })
    const result = await productService.getById('1')
    expect(axios.get).toHaveBeenCalledWith(`${API_URL}/products/1`, expect.any(Object))
    expect(result).toEqual(mockData)
  })

  it('create calls axios.post', async () => {
    const mockData = { name: 'New' }
    vi.mocked(axios.post).mockResolvedValue({ data: { id: 1, ...mockData } })
    const result = await productService.create(mockData)
    expect(axios.post).toHaveBeenCalledWith(`${API_URL}/products`, mockData, expect.any(Object))
    expect(result).toEqual({ id: 1, ...mockData })
  })

  it('update calls axios.put', async () => {
    const mockData = { name: 'Updated' }
    vi.mocked(axios.put).mockResolvedValue({ data: mockData })
    const result = await productService.update('1', mockData)
    expect(axios.put).toHaveBeenCalledWith(`${API_URL}/products/1`, mockData, expect.any(Object))
    expect(result).toEqual(mockData)
  })

  it('delete calls axios.delete', async () => {
    vi.mocked(axios.delete).mockResolvedValue({ data: {} })
    await productService.delete('1')
    expect(axios.delete).toHaveBeenCalledWith(`${API_URL}/products/1`, expect.any(Object))
  })

  it('patch calls axios.patch', async () => {
    const mockData = { status: 'ACTIVE' }
    vi.mocked(axios.patch).mockResolvedValue({ data: mockData })
    const result = await productService.patch('1', mockData)
    expect(axios.patch).toHaveBeenCalledWith(`${API_URL}/products/1`, mockData, expect.any(Object))
    expect(result).toEqual(mockData)
  })

  it('getFinancialEntities calls axios.get', async () => {
    const mockData = [{ id: 1, name: 'Bank' }]
    vi.mocked(axios.get).mockResolvedValue({ data: mockData })
    const result = await productService.getFinancialEntities()
    expect(axios.get).toHaveBeenCalledWith(`${API_URL}/financial-entities`, expect.any(Object))
    expect(result).toEqual(mockData)
  })
})