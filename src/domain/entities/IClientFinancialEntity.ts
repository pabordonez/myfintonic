import { IFinancialEntity } from './IFinancialEntity';
import { IClientFinancialEntityValueHistory } from './IClientFinancialEntityHistory';

export interface IClientFinancialEntity {
  id: string;
  balance: number;
  clientId: string;
  financialEntityId: string;
  financialEntity?: IFinancialEntity;
  createdAt: Date;
  updatedAt: Date;
  valueHistory?: IClientFinancialEntityValueHistory[];
}