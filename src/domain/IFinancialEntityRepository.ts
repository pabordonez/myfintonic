import { IFinancialEntity } from './entities/IFinancialEntity'

export interface IFinancialEntityRepository {
  findAll(filters?: Partial<IFinancialEntity>): Promise<IFinancialEntity[]>
  findById(id: string): Promise<IFinancialEntity | null>
  create(entity: IFinancialEntity): Promise<IFinancialEntity>
  update(id: string, entity: Partial<IFinancialEntity>): Promise<void>
  delete(id: string): Promise<void>
}
