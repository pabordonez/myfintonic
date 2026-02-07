import { describe, it, expect, vi, beforeEach } from 'vitest'
import { clientFinancialEntityService } from '../features/client-financial-entities/services/clientFinancialEntity.service'
import axios from 'axios'
import { API_URL } from '../config/api'

vi.mock('axios')

describe('clientFinancialEntityService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getByClientId calls axios.get with credentials', async () => {
    const mockData = [{ id: '1', balance: 100 }]
    vi.mocked(axios.get).mockResolvedValue({ data: mockData })

    const result = await clientFinancialEntityService.getByClientId('c1')

    expect(axios.get).toHaveBeenCalledWith(
      `${API_URL}/clients/c1/financial-entities`,
      expect.objectContaining({ withCredentials: true })
    )
    expect(result).toEqual(mockData)
  })

  it('getById calls axios.get with credentials', async () => {
    const mockData = { id: 'assoc1', balance: 100 }
    vi.mocked(axios.get).mockResolvedValue({ data: mockData })

    const result = await clientFinancialEntityService.getById('c1', 'assoc1')

    expect(axios.get).toHaveBeenCalledWith(
      `${API_URL}/clients/c1/financial-entities/assoc1`,
      expect.objectContaining({ withCredentials: true })
    )
    expect(result).toEqual(mockData)
  })

  it('create calls axios.post with credentials', async () => {
    const mockData = { id: '1', balance: 100 }
    const payload = { financialEntityId: 'fe1', balance: 100 }
    vi.mocked(axios.post).mockResolvedValue({ data: mockData })

    const result = await clientFinancialEntityService.create('c1', payload)

    expect(axios.post).toHaveBeenCalledWith(
      `${API_URL}/clients/c1/financial-entities`,
      payload,
      expect.objectContaining({ withCredentials: true })
    )
    expect(result).toEqual(mockData)
  })

  it('update calls axios.put with credentials', async () => {
    vi.mocked(axios.put).mockResolvedValue({ data: {} })
    const payload = { balance: 200 }

    await clientFinancialEntityService.update('c1', 'assoc1', payload)

    expect(axios.put).toHaveBeenCalledWith(
      `${API_URL}/clients/c1/financial-entities/assoc1`,
      payload,
      expect.objectContaining({ withCredentials: true })
    )
  })

  it('delete calls axios.delete with credentials', async () => {
    vi.mocked(axios.delete).mockResolvedValue({ data: {} })

    await clientFinancialEntityService.delete('c1', 'assoc1')

    expect(axios.delete).toHaveBeenCalledWith(
      `${API_URL}/clients/c1/financial-entities/assoc1`,
      expect.objectContaining({ withCredentials: true })
    )
  })
})
