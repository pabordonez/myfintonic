import { describe, it, expect, vi, beforeEach } from 'vitest'
import { clientFinancialEntityService } from '../features/client-financial-entities/services/clientFinancialEntity.service'
import { api } from '../config/api'

// Mockeamos la instancia centralizada de api
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

describe('clientFinancialEntityService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getByClientId calls api.get', async () => {
    const mockData = [{ id: '1', balance: 100 }]
    vi.mocked(api.get).mockResolvedValue({ data: mockData })

    const result = await clientFinancialEntityService.getByClientId('c1')

    expect(api.get).toHaveBeenCalledWith('/clients/c1/financial-entities')
    expect(result).toEqual(mockData)
  })

  it('getById calls api.get', async () => {
    const mockData = { id: 'assoc1', balance: 100 }
    vi.mocked(api.get).mockResolvedValue({ data: mockData })

    const result = await clientFinancialEntityService.getById('c1', 'assoc1')

    expect(api.get).toHaveBeenCalledWith(
      '/clients/c1/financial-entities/assoc1'
    )
    expect(result).toEqual(mockData)
  })

  it('create calls api.post', async () => {
    const mockData = { id: '1', balance: 100 }
    const payload = { financialEntityId: 'fe1', balance: 100 }
    vi.mocked(api.post).mockResolvedValue({ data: mockData })

    const result = await clientFinancialEntityService.create('c1', payload)

    expect(api.post).toHaveBeenCalledWith(
      '/clients/c1/financial-entities',
      payload
    )
    expect(result).toEqual(mockData)
  })

  it('update calls api.put', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: {} })
    const payload = { balance: 200 }

    await clientFinancialEntityService.update('c1', 'assoc1', payload)

    expect(api.put).toHaveBeenCalledWith(
      '/clients/c1/financial-entities/assoc1',
      payload
    )
  })

  it('delete calls api.delete', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: {} })

    await clientFinancialEntityService.delete('c1', 'assoc1')

    expect(api.delete).toHaveBeenCalledWith(
      '/clients/c1/financial-entities/assoc1'
    )
  })

  it('getAllAssociations calls api.get', async () => {
    const mockData = [{ id: '1', balance: 100 }]
    vi.mocked(api.get).mockResolvedValue({ data: mockData })

    const result = await clientFinancialEntityService.getAllAssociations()

    expect(api.get).toHaveBeenCalledWith('/clients-financial-entities')
    expect(result).toEqual(mockData)
  })
})
