import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ClientFinancialEntityUseCases } from '../../src/application/useCases/clientFinancialEntityUseCases'
import { IClientFinancialEntityRepository } from '../../src/domain/repository/IClientFinancialEntityRepository'
import { ClientFinancialEntity } from '../../src/domain/factories/clientFinancialEntity'

const mockRepo = {
  create: vi.fn(),
  findAll: vi.fn(),
  findAllWithClients: vi.fn(),
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
      const data = {
        clientId: 'c1',
        financialEntityId: 'f1',
        balance: 100,
        initialBalance: 100,
      }
      const uuid = 'uuid-123'
      await useCases.createAssociation(data, uuid)
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.any(ClientFinancialEntity)
      )
    })
  })

  describe('getAssociations', () => {
    it('should call repo.findAll', async () => {
      await useCases.getAssociations({})
      expect(mockRepo.findAll).toHaveBeenCalled()
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
    it('should throw if not found', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(null)
      await expect(
        useCases.updateBalance('1', { balance: 200 })
      ).rejects.toThrow('Client Financial Entity association not found')
    })

    it('should call repo.update if found', async () => {
      const mockEntity = {
        id: '1',
        balance: 100,
        updateBalance: vi.fn(),
      }
      vi.mocked(mockRepo.findById).mockResolvedValue(mockEntity as any)

      await useCases.updateBalance('1', { balance: 200 })

      expect(mockEntity.updateBalance).toHaveBeenCalledWith(200)
      expect(mockRepo.update).toHaveBeenCalledWith(mockEntity)
    })
  })

  describe('deleteAssociation', () => {
    it('should throw if not found', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(null)
      await expect(useCases.deleteAssociation('1')).rejects.toThrow(
        'Client Financial Entity association not found'
      )
    })

    it('should call repo.delete if found', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue({ id: '1' } as any)
      await useCases.deleteAssociation('1')
      expect(mockRepo.delete).toHaveBeenCalledWith('1')
    })
  })
})
