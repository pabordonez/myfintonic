import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FinancialEntityUseCases } from '../../src/application/useCases/financialEntityUseCases'
import { IFinancialEntityRepository } from '../src/domain/repository/IFinancialEntityRepository'

const mockRepo = {
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
} as unknown as IFinancialEntityRepository

const useCases = new FinancialEntityUseCases(mockRepo)

describe('FinancialEntityUseCases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createEntity should call repository.create', async () => {
    const data = { name: 'Bank' }
    await useCases.createEntity(data)
    expect(mockRepo.create).toHaveBeenCalledWith(data)
  })

  it('getEntities should call repository.findAll', async () => {
    await useCases.getEntities()
    expect(mockRepo.findAll).toHaveBeenCalled()
  })

  it('getEntityById should call repository.findById', async () => {
    await useCases.getEntityById('1')
    expect(mockRepo.findById).toHaveBeenCalledWith('1')
  })

  it('updateEntity should throw if not found', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null)
    await expect(useCases.updateEntity('1', { name: 'New' })).rejects.toThrow('Financial Entity not found')
  })

  it('updateEntity should call repository.update if found', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue({ id: '1' } as any)
    await useCases.updateEntity('1', { name: 'New' })
    expect(mockRepo.update).toHaveBeenCalledWith('1', { name: 'New' })
  })

  it('deleteEntity should throw if not found', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null)
    await expect(useCases.deleteEntity('1')).rejects.toThrow('Financial Entity not found')
  })

  it('deleteEntity should call repository.delete if found', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue({ id: '1' } as any)
    await useCases.deleteEntity('1')
    expect(mockRepo.delete).toHaveBeenCalledWith('1')
  })
})