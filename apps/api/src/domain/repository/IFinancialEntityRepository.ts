import { IFinancialEntity } from '@domain/entities/IFinancialEntity'

export interface IFinancialEntityRepository {
  findAll(
    filters?: Partial<IFinancialEntity> & { name?: string }
  ): Promise<IFinancialEntity[]>
  findById(id: string): Promise<IFinancialEntity | null>
  create(data: Partial<IFinancialEntity>): Promise<IFinancialEntity>
  update(id: string, entity: Partial<IFinancialEntity>): Promise<void>
  delete(id: string): Promise<void>
}
