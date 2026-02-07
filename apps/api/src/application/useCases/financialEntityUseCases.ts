import { IFinancialEntity } from '@domain/entities/IFinancialEntity'
import { IFinancialEntityRepository } from '@domain/repository/IFinancialEntityRepository'
import {
  CreateFinancialEntityDto,
  UpdateFinancialEntityDto,
} from '@application/dtos/financialEntityDto'

export class FinancialEntityUseCases {
  constructor(private repository: IFinancialEntityRepository) {}

  async createEntity(
    data: CreateFinancialEntityDto
  ): Promise<IFinancialEntity> {
    return this.repository.create(data)
  }

  async getEntities(
    filters?: Partial<IFinancialEntity> & { name?: string }
  ): Promise<IFinancialEntity[]> {
    return this.repository.findAll(filters)
  }

  async getEntityById(id: string): Promise<IFinancialEntity | null> {
    return this.repository.findById(id)
  }

  async updateEntity(
    id: string,
    data: UpdateFinancialEntityDto
  ): Promise<void> {
    const exists = await this.repository.findById(id)
    if (!exists) throw new Error('Financial Entity not found')
    await this.repository.update(id, data)
  }

  async deleteEntity(id: string): Promise<void> {
    const exists = await this.repository.findById(id)
    if (!exists) throw new Error('Financial Entity not found')
    await this.repository.delete(id)
  }
}
