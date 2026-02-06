import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ClientFinancialEntityUseCases } from '../../src/application/useCases/clientFinancialEntityUseCases'
import { IClientFinancialEntityRepository } from '../src/domain/repository/IClientFinancialEntityRepository'

const mockRepo = {
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  findAllWithClients: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}  as IClientFinancialEntityRepository


const useCases = new ClientFinancialEntityUseCases(mockRepo)

describe('ClientFinancialEntityUseCases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createAssociation', () => {
    it('should call repo.create', async () => {
      const data = { clientId: 'c1', financialEntityId: 'fe1', balance: 100 }
      await useCases.createAssociation(data)
      expect(mockRepo.create).toHaveBeenCalledWith(data)
    })
  })

  describe('getAssociations', () => {
    it('should call repo.findAll', async () => {
      const filters = { clientId: 'c1' }
      await useCases.getAssociations(filters)
      expect(mockRepo.findAll).toHaveBeenCalledWith(filters)
    })
  })

  describe('getAllAssociations', () => {
    it('should call repo.findAllWithClients', async () => {
      await useCases.getAllAssociations()
      expect(mockRepo.findAllWithClients).toHaveBeenCalled()
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
      await expect(useCases.updateBalance('1', { balance: 200 })).rejects.toThrow('Client Financial Entity association not found')
    })

    it('should call repo.update if found', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue({ id: '1' } as any)
      await useCases.updateBalance('1', { balance: 200 })
      expect(mockRepo.update).toHaveBeenCalledWith('1', { balance: 200 })
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