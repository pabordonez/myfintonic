import { IClientRepository } from '@domain/repository/IClientRepository'
import { RegisterClientDto, UpdateClientDto } from '@application/dtos/clientDto'
import { ClientFactory } from '@domain/factories/clientFactory'
import { IEncryptionService } from '@application/interfaces/IEncryptionService'

export class ClientUseCases {
  constructor(
    private clientRepository: IClientRepository,
    private clientFactory: ClientFactory,
    private encryptionService: IEncryptionService
  ) {}

  async register(data: RegisterClientDto) {
    const hashedPassword = await this.encryptionService.hash(data.password)
    const clientData = {
      ...data,
      createdAt: new Date(),
      password: hashedPassword,
    }
    return this.clientRepository.create(this.clientFactory.create(clientData))
  }

  async getClients() {
    return this.clientRepository.findAll()
  }

  async updateClient(id: string, data: UpdateClientDto) {
    return this.clientRepository.update(id, this.clientFactory.update(data))
  }

  async getClientById(id: string) {
    return this.clientRepository.findById(id)
  }

  //TODO REFACTORIZAR PARA SACARLO PARTE DE LA
  // LOGICA A infrastructure PUES TIENE DEPENDENCIAS DE BCRYP
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
    await this.clientRepository.update(targetUserId, {
      password: hashedPassword,
    })
  }
}
