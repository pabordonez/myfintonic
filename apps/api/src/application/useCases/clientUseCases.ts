import { IClientRepository } from '@domain/repository/IClientRepository'
import { RegisterClientDto, UpdateClientDto } from '@application/dtos/clientDto'
import bcrypt from 'bcrypt'

export class ClientUseCases {
  constructor(private clientRepository: IClientRepository) {}

  async register(data: RegisterClientDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10)
    const clientData = { ...data, password: hashedPassword }
    return this.clientRepository.create(clientData)
  }

  async getClients() {
    return this.clientRepository.findAll()
  }

  async updateClient(id: string, data: UpdateClientDto) {
    // Aquí podrían ir validaciones de negocio adicionales antes de guardar
    return this.clientRepository.update(id, data)
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

      const isValid = await bcrypt.compare(currentPassword, user.password)
      if (!isValid) {
        throw new Error('Invalid current password')
      }
    }

    // 3. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 4. Update
    // Assuming update method accepts Partial<Client> or similar
    await this.clientRepository.update(targetUserId, {
      password: hashedPassword,
    })
  }
}
