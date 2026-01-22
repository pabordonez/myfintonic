import { IFinancialEntity } from '../../domain/entities/IFinancialEntity';
import { IFinancialEntityRepository } from '../../domain/IFinancialEntityRepository';
import { randomUUID } from 'crypto';

export class FinancialEntityUseCases {
  constructor(private repository: IFinancialEntityRepository) {}

  async createEntity(data: Omit<IFinancialEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<IFinancialEntity> {
    const newEntity: IFinancialEntity = {
      id: randomUUID(),
      ...data
    };
    return this.repository.create(newEntity);
  }

  async getEntities(filters?: Partial<IFinancialEntity>): Promise<IFinancialEntity[]> {
    return this.repository.findAll(filters);
  }

  async getEntityById(id: string): Promise<IFinancialEntity | null> {
    return this.repository.findById(id);
  }

  async updateEntity(id: string, data: Partial<IFinancialEntity>): Promise<void> {
    const exists = await this.repository.findById(id);
    if (!exists) throw new Error('Financial Entity not found');
    await this.repository.update(id, data);
  }

  async deleteEntity(id: string): Promise<void> {
    const exists = await this.repository.findById(id);
    if (!exists) throw new Error('Financial Entity not found');
    await this.repository.delete(id);
  }
}