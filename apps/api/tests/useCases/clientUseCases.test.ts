import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ClientUseCases } from '../../src/application/useCases/clientUseCases'
import { IClientRepository } from '../../src/domain/repository/IClientRepository'
import { IEncryptionService } from '../../src/application/interfaces/IEncryptionService'

const mockRepo = {
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  findByEmail: vi.fn(),
  update: vi.fn(),
} as unknown as IClientRepository

const mockEncryptionService = {
  hash: vi.fn(),
  compare: vi.fn(),
} as unknown as IEncryptionService

const useCases = new ClientUseCases(mockRepo, mockEncryptionService)

describe('ClientUseCases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('register', () => {
    it('should register a client with hashed password', async () => {
      const data = {
        email: 'test@test.com',
        password: '123',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
      } as any
      const uuid = 'uuid-123'

      vi.mocked(mockEncryptionService.hash).mockResolvedValue('hashed-123')
      vi.mocked(mockRepo.create).mockResolvedValue({
        ...data,
        id: uuid,
        password: 'hashed-123',
      } as any)

      await useCases.register(data, uuid)

      expect(mockEncryptionService.hash).toHaveBeenCalledWith('123')
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: uuid,
          password: 'hashed-123',
        })
      )
    })
  })

  describe('changePassword', () => {
    it('should succeed if USER provides valid current password', async () => {
      const targetUserId = 'u1'
      const newPassword = 'new-password'
      const currentPassword = 'old-password'
      const requestorRole = 'USER'
      const requestorId = 'u1'

      const mockUser = {
        id: 'u1',
        password: 'hashed-old-password',
        update: vi.fn(),
      }

      vi.mocked(mockRepo.findById).mockResolvedValue(mockUser as any)
      vi.mocked(mockEncryptionService.compare).mockResolvedValue(true)
      vi.mocked(mockEncryptionService.hash).mockResolvedValue(
        'hashed-new-password'
      )

      await useCases.changePassword(
        targetUserId,
        newPassword,
        currentPassword,
        requestorRole,
        requestorId
      )

      expect(mockEncryptionService.compare).toHaveBeenCalledWith(
        currentPassword,
        'hashed-old-password'
      )
      expect(mockUser.update).toHaveBeenCalledWith({
        password: 'hashed-new-password',
      })
      expect(mockRepo.update).toHaveBeenCalledWith(mockUser)
    })

    it('should throw if USER provides invalid current password', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue({
        password: 'hash',
      } as any)
      vi.mocked(mockEncryptionService.compare).mockResolvedValue(false)

      await expect(
        useCases.changePassword('u1', 'new', 'wrong', 'USER', 'u1')
      ).rejects.toThrow('Invalid current password')
    })
  })
})
