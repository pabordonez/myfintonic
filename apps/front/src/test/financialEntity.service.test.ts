import { describe, it, expect, vi, beforeEach } from 'vitest'
import { financialEntityService } from '../features/financial-entities/services/financialEntity.service'
import axios from 'axios'
import { API_URL } from '../config/api'

vi.mock('axios')

describe('financialEntityService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getAll calls axios.get with credentials', async () => {
    const mockData = [{ id: '1', name: 'Bank' }]
    vi.mocked(axios.get).mockResolvedValue({ data: mockData })

    const result = await financialEntityService.getAll()

    expect(axios.get).toHaveBeenCalledWith(
      `${API_URL}/financial-entities`,
      expect.objectContaining({ withCredentials: true })
    )
    expect(result).toEqual(mockData)
  })

  it('create calls axios.post with credentials', async () => {
    const mockData = { id: '1', name: 'Bank' }
    const payload = { name: 'Bank' }
    vi.mocked(axios.post).mockResolvedValue({ data: mockData })

    const result = await financialEntityService.create(payload)

    expect(axios.post).toHaveBeenCalledWith(
      `${API_URL}/financial-entities`,
      payload,
      expect.objectContaining({ withCredentials: true })
    )
    expect(result).toEqual(mockData)
  })

  it('update calls axios.put with credentials', async () => {
    vi.mocked(axios.put).mockResolvedValue({ data: {} })
    const payload = { name: 'Updated Bank' }

    await financialEntityService.update('1', payload)

    expect(axios.put).toHaveBeenCalledWith(
      `${API_URL}/financial-entities/1`,
      payload,
      expect.objectContaining({ withCredentials: true })
    )
  })

  it('delete calls axios.delete with credentials', async () => {
    vi.mocked(axios.delete).mockResolvedValue({ data: {} })

    await financialEntityService.delete('1')

    expect(axios.delete).toHaveBeenCalledWith(
      `${API_URL}/financial-entities/1`,
      expect.objectContaining({ withCredentials: true })
    )
  })
})
