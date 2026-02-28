import { IFinancialEntityRepository } from '@domain/repository/IFinancialEntityRepository'
import {
  CreateFinancialEntityDto,
  UpdateFinancialEntityDto,
} from '@application/dtos/financialEntityDto'
import { FinancialEntity } from '@domain/models/financialEntity'

export class FinancialEntityUseCases {
  constructor(private repository: IFinancialEntityRepository) {}

  async createEntity(
    data: CreateFinancialEntityDto,
    uuid: string
  ): Promise<FinancialEntity> {
    const entity = FinancialEntity.create(data.name, uuid)
    return this.repository.create(entity)
  }

  async getEntities(filters?: { name?: string }): Promise<FinancialEntity[]> {
    return this.repository.findAll(filters)
  }

  async getEntityById(id: string): Promise<FinancialEntity | null> {
    return this.repository.findById(id)
  }

  async updateEntity(
    id: string,
    data: UpdateFinancialEntityDto
  ): Promise<void> {
    const financialEntity = await this.repository.findById(id)
    if (!financialEntity) throw new Error('Financial Entity not found')

    if (data.name) {
      financialEntity.update(data.name)
    }
    await this.repository.update(id, financialEntity)
  }

  async deleteEntity(id: string): Promise<void> {
    const exists = await this.repository.findById(id)
    if (!exists) throw new Error('Financial Entity not found')
    await this.repository.delete(id)
  }
}
