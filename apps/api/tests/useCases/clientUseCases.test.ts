import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ClientUseCases } from '../../src/application/useCases/clientUseCases'
import { ClientRepository } from '../src/domain/repository/IClientRepository'

const mockRepo = {
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
} as unknown as ClientRepository

const mockFactory = {
  create: vi.fn((data) => data),
  update: vi.fn((data) => data),
} as any

const mockEncryptionService = {
  hash: vi.fn((pass) => Promise.resolve(`hashed_${pass}`)),
  compare: vi.fn(() => Promise.resolve(true)),
} as any

const useCases = new ClientUseCases(
  mockRepo,
  mockFactory,
  mockEncryptionService
)

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

  describe('changePassword', () => {
    it('should allow ADMIN to change password without current password', async () => {
      await useCases.changePassword(
        'target-id',
        'new-pass',
        undefined,
        'ADMIN',
        'admin-id'
      )

      expect(mockEncryptionService.hash).toHaveBeenCalledWith('new-pass')
      expect(mockRepo.update).toHaveBeenCalledWith('target-id', {
        password: 'hashed_new-pass',
      })
    })

    it('should throw Forbidden if USER tries to change another users password', async () => {
      await expect(
        useCases.changePassword(
          'target-id',
          'new-pass',
          'old',
          'USER',
          'other-id'
        )
      ).rejects.toThrow('Forbidden: You can only change your own password')
    })

    it('should throw if USER does not provide current password', async () => {
      await expect(
        useCases.changePassword(
          'target-id',
          'new-pass',
          undefined,
          'USER',
          'target-id'
        )
      ).rejects.toThrow('Current password is required')
    })

    it('should throw if USER provides invalid current password', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue({
        id: 'target-id',
        password: 'hashed_old_pass',
      } as any)
      vi.mocked(mockEncryptionService.compare).mockResolvedValue(false)

      await expect(
        useCases.changePassword(
          'target-id',
          'new-pass',
          'wrong-old',
          'USER',
          'target-id'
        )
      ).rejects.toThrow('Invalid current password')
    })

    it('should throw if user not found', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(null)

      await expect(
        useCases.changePassword(
          'target-id',
          'new-pass',
          'old',
          'USER',
          'target-id'
        )
      ).rejects.toThrow('User not found')
    })

    it('should succeed if USER provides valid current password', async () => {
      // Mockear usuario existente
      vi.mocked(mockRepo.findById).mockResolvedValue({
        id: 'target-id',
        password: 'hashed_old_pass',
      } as any)
      // Mockear que la contraseña coincide
      vi.mocked(mockEncryptionService.compare).mockResolvedValue(true)

      await useCases.changePassword(
        'target-id',
        'new-pass',
        'correct-old',
        'USER',
        'target-id'
      )

      // Verificar que se comparó la contraseña antigua
      expect(mockEncryptionService.compare).toHaveBeenCalledWith(
        'correct-old',
        'hashed_old_pass'
      )
      // Verificar que se hasheó la nueva
      expect(mockEncryptionService.hash).toHaveBeenCalledWith('new-pass')
      // Verificar que se actualizó en repo
      expect(mockRepo.update).toHaveBeenCalledWith('target-id', {
        password: 'hashed_new-pass',
      })
    })
  })
})
