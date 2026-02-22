import { IFinancialEntity } from '@domain/entities/IFinancialEntity'
import { FinancialEntity } from '@domain/factories/financialEntity'

export interface IFinancialEntityRepository {
  findAll(
    filters?: Partial<IFinancialEntity> & { name?: string }
  ): Promise<FinancialEntity[]>
  findById(id: string): Promise<FinancialEntity | null>
  create(entity: FinancialEntity): Promise<FinancialEntity>
  update(id: string, entity: FinancialEntity): Promise<void>
  delete(id: string): Promise<void>
}
