import { IFinancialEntity } from '@domain/entities/IFinancialEntity'
import { IFinancialEntityRepository } from '@domain/repository/IFinancialEntityRepository'
import {
  CreateFinancialEntityDto,
  UpdateFinancialEntityDto,
} from '@application/dtos/financialEntityDto'
import { financialEntityFactory } from '@domain/factories/financialEntityFactory'

export class FinancialEntityUseCases {
  constructor(private repository: IFinancialEntityRepository) {}

  async createEntity(
    data: CreateFinancialEntityDto
  ): Promise<IFinancialEntity> {
    return this.repository.create(financialEntityFactory.create(data.name))
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
    const financialEntity = await this.repository.findById(id)
    if (!financialEntity) throw new Error('Financial Entity not found')

    // Enfoque Pragmático: Mapeo directo a Partial<IFinancialEntity>
    // No hidratamos toda la entidad de dominio, solo enviamos lo que cambia.
    await this.repository.update(id, {
      ...data,
    })
  }

  async deleteEntity(id: string): Promise<void> {
    const exists = await this.repository.findById(id)
    if (!exists) throw new Error('Financial Entity not found')
    await this.repository.delete(id)
  }
}
