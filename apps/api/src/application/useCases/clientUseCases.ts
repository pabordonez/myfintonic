import { IClientRepository } from '@domain/repository/IClientRepository'
import { RegisterClientDto, UpdateClientDto } from '@application/dtos/clientDto'
import { IEncryptionService } from '@application/interfaces/IEncryptionService'
import { clientEntity } from '@domain/factories/clientEntity'

export class ClientUseCases {
  constructor(
    private clientRepository: IClientRepository,
    private encryptionService: IEncryptionService
  ) {}

  async register(data: RegisterClientDto, uuid: string) {
    const hashedPassword = await this.encryptionService.hash(data.password)
    const client = clientEntity.create(
      {
        ...data,
        password: hashedPassword,
      },
      uuid
    )
    return this.clientRepository.create(client)
  }

  async getClients() {
    return this.clientRepository.findAll()
  }

  async updateClient(id: string, data: UpdateClientDto) {
    const client = await this.clientRepository.findById(id)
    if (!client) throw new Error('Client not found')

    client.update(data)
    return this.clientRepository.update(client)
  }

  async getClientById(id: string) {
    return this.clientRepository.findById(id)
  }

  async changePassword(
    targetUserId: string,
    newPassword: string,
    currentPassword?: string,
    requestorRole?: string,
    requestorId?: string
  ): Promise<void> {
    // 1. Security Check
    if (requestorRole !== 'ADMIN') {
      if (targetUserId !== requestorId) {
        throw new Error('Forbidden: You can only change your own password')
      }

      // 2. Verify current password for USER
      if (!currentPassword) {
        throw new Error('Current password is required')
      }

      const user = await this.clientRepository.findById(targetUserId)
      if (!user) throw new Error('User not found')

      const isValid = await this.encryptionService.compare(
        currentPassword,
        user.password
      )
      if (!isValid) {
        throw new Error('Invalid current password')
      }
    }

    // 3. Hash new password
    const hashedPassword = await this.encryptionService.hash(newPassword)

    // 4. Update
    // Assuming update method accepts Partial<Client> or similar
    const clientToUpdate = await this.clientRepository.findById(targetUserId)
    if (clientToUpdate) {
      clientToUpdate.update({ password: hashedPassword })
      await this.clientRepository.update(clientToUpdate)
    }
  }
}
