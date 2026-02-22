import { IClientFinancialEntityRepository } from '@domain/repository/IClientFinancialEntityRepository'
import {
  CreateClientFinancialEntityDto,
  UpdateClientFinancialEntityDto,
} from '@application/dtos/clientFinancialEntityDto'
import { ClientFinancialEntity } from '@domain/models/clientFinancialEntity'

export class ClientFinancialEntityUseCases {
  constructor(private repository: IClientFinancialEntityRepository) {}

  async createAssociation(
    data: CreateClientFinancialEntityDto,
    uuid: string
  ): Promise<ClientFinancialEntity> {
    const entity = ClientFinancialEntity.create(data, uuid)
    return this.repository.create(entity)
  }

  async getAssociations(filters?: {
    clientId?: string
    financialEntityId?: string
    name?: string
  }): Promise<ClientFinancialEntity[]> {
    return this.repository.findAll(filters)
  }

  async getAllAssociations(): Promise<ClientFinancialEntity[]> {
    return this.repository.findAllWithClients()
  }

  async getAssociationById(id: string): Promise<ClientFinancialEntity | null> {
    return this.repository.findById(id)
  }

  async updateBalance(
    id: string,
    data: UpdateClientFinancialEntityDto
  ): Promise<void> {
    const entity = await this.repository.findById(id)
    if (!entity)
      throw new Error('Client Financial Entity association not found')

    if (data.balance !== undefined) {
      entity.updateBalance(data.balance)
    }
    await this.repository.update(entity)
  }

  async deleteAssociation(id: string): Promise<void> {
    const exists = await this.repository.findById(id)
    if (!exists)
      throw new Error('Client Financial Entity association not found')
    await this.repository.delete(id)
  }
}
