import { describe, it, expect, vi, beforeEach } from 'vitest'
import { financialEntityService } from '../features/financial-entities/services/financialEntity.service'
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
  API_URL: 'http://localhost:3000',
}))

describe('financialEntityService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getAll calls axios.get with credentials', async () => {
    const mockData = [{ id: '1', name: 'Bank' }]
    vi.mocked(api.get).mockResolvedValue({ data: mockData })

    const result = await financialEntityService.getAll()

    expect(api.get).toHaveBeenCalledWith('/financial-entities')
    expect(result).toEqual(mockData)
  })

  it('getById calls axios.get with credentials', async () => {
    const mockData = { id: '1', name: 'Bank' }
    vi.mocked(api.get).mockResolvedValue({ data: mockData })

    const result = await financialEntityService.getById('1')

    expect(api.get).toHaveBeenCalledWith('/financial-entities/1')
    expect(result).toEqual(mockData)
  })

  it('create calls axios.post with credentials', async () => {
    const mockData = { id: '1', name: 'Bank' }
    const payload = { name: 'Bank' }
    vi.mocked(api.post).mockResolvedValue({ data: mockData })

    const result = await financialEntityService.create(payload)

    expect(api.post).toHaveBeenCalledWith('/financial-entities', payload)
    expect(result).toEqual(mockData)
  })

  it('update calls axios.put with credentials', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: {} })
    const payload = { name: 'Updated Bank' }

    await financialEntityService.update('1', payload)

    expect(api.put).toHaveBeenCalledWith('/financial-entities/1', payload)
  })

  it('delete calls axios.delete with credentials', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: {} })

    await financialEntityService.delete('1')

    expect(api.delete).toHaveBeenCalledWith('/financial-entities/1')
  })
})
