import { IClientFinancialEntity } from '@domain/entities/IClientFinancialEntity'

export interface IClientFinancialEntityRepository {
  findAll(
    filters?: Partial<IClientFinancialEntity> & { name?: string }
  ): Promise<IClientFinancialEntity[]>
  findById(id: string): Promise<IClientFinancialEntity | null>
  findAllWithClients(): Promise<IClientFinancialEntity[]>
  create(data: Partial<IClientFinancialEntity>): Promise<IClientFinancialEntity>
  update(id: string, entity: Partial<IClientFinancialEntity>): Promise<void>
  delete(id: string): Promise<void>
}
