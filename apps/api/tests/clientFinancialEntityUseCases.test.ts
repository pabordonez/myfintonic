import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ClientFinancialEntityUseCases } from '../src/application/useCases/clientFinancialEntityUseCases'
import { IClientFinancialEntityRepository } from '../src/domain/IClientFinancialEntityRepository'

const mockRepo = {
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
} as unknown as IClientFinancialEntityRepository

const useCases = new ClientFinancialEntityUseCases(mockRepo)

describe('ClientFinancialEntityUseCases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createAssociation', () => {
    it('should call repo.create', async () => {
      await useCases.createAssociation({} as any)
      expect(mockRepo.create).toHaveBeenCalled()
    })
  })

  describe('getAssociations', () => {
    it('should call repo.findAll', async () => {
      await useCases.getAssociations({})
      expect(mockRepo.findAll).toHaveBeenCalled()
    })
  })

  describe('getAssociationById', () => {
    it('should call repo.findById', async () => {
      await useCases.getAssociationById('1')
      expect(mockRepo.findById).toHaveBeenCalledWith('1')
    })
  })

  describe('updateBalance', () => {
    it('should throw if association not found', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(null)
      await expect(useCases.updateBalance('1', { balance: 100 })).rejects.toThrow('Client Financial Entity association not found')
    })

    it('should call repo.update if found', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue({ id: '1' } as any)
      await useCases.updateBalance('1', { balance: 100 })
      expect(mockRepo.update).toHaveBeenCalledWith('1', { balance: 100 })
    })
  })

  describe('deleteAssociation', () => {
    it('should throw if association not found', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(null)
      await expect(useCases.deleteAssociation('1')).rejects.toThrow('Client Financial Entity association not found')
    })

    it('should call repo.delete if found', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue({ id: '1' } as any)
      await useCases.deleteAssociation('1')
      expect(mockRepo.delete).toHaveBeenCalledWith('1')
    })
  })
})