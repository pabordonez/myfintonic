import { IFinancialEntity } from './entities/IFinancialEntity';
import { CreateFinancialEntityDto } from '../application/dtos/financialEntityDto';

export interface IFinancialEntityRepository {
  findAll(filters?: Partial<IFinancialEntity> & { name?: string }): Promise<IFinancialEntity[]>;
  findById(id: string): Promise<IFinancialEntity | null>;
  create(data: CreateFinancialEntityDto): Promise<IFinancialEntity>;
  update(id: string, entity: Partial<IFinancialEntity>): Promise<void>;
  delete(id: string): Promise<void>;
}