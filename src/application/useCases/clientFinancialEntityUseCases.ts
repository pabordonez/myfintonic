import { IClientFinancialEntity } from '@domain/entities/IClientFinancialEntity';
import { IClientFinancialEntityRepository } from '@domain/IClientFinancialEntityRepository';
import { CreateClientFinancialEntityDto, UpdateClientFinancialEntityDto } from '@application/dtos/clientFinancialEntityDto';

export class ClientFinancialEntityUseCases {
  constructor(private repository: IClientFinancialEntityRepository) {}

  async createAssociation(data: CreateClientFinancialEntityDto): Promise<IClientFinancialEntity> {
    return this.repository.create(data);
  }

  async getAssociations(filters?: Partial<IClientFinancialEntity>): Promise<IClientFinancialEntity[]> {
    return this.repository.findAll(filters);
  }

  async getAssociationById(id: string): Promise<IClientFinancialEntity | null> {
    return this.repository.findById(id);
  }

  async updateBalance(id: string, data: UpdateClientFinancialEntityDto): Promise<void> {
    const exists = await this.repository.findById(id);
    if (!exists) throw new Error('Client Financial Entity association not found');
    
    // El repositorio ya se encarga de crear el histórico si el balance cambia
    await this.repository.update(id, data);
  }

  async deleteAssociation(id: string): Promise<void> {
    const exists = await this.repository.findById(id);
    if (!exists) throw new Error('Client Financial Entity association not found');
    await this.repository.delete(id);
  }
}
