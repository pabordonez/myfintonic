import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ClientUseCases } from '../../src/application/useCases/clientUseCases'
import { ClientRepository } from '../src/domain/repository/IClientRepository'

const mockRepo = {
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
} as unknown as ClientRepository

const useCases = new ClientUseCases(mockRepo)

describe('ClientUseCases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getClients should call repository.findAll', async () => {
    await useCases.getClients()
    expect(mockRepo.findAll).toHaveBeenCalled()
  })

  it('getClientById should call repository.findById', async () => {
    const id = '1'
    await useCases.getClientById(id)
    expect(mockRepo.findById).toHaveBeenCalledWith(id)
  })

  it('updateClient should call repository.update', async () => {
    const id = '1'
    const data = { firstName: 'Updated' }
    await useCases.updateClient(id, data)
    expect(mockRepo.update).toHaveBeenCalledWith(id, data)
  })
})
