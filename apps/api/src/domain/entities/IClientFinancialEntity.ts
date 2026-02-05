import { IFinancialEntity } from './IFinancialEntity';
import { IClientDetails } from './IClient';
import { IClientFinancialEntityValueHistory } from './IClientFinancialEntityHistory';

export interface IClientFinancialEntity {
  id: string;
  balance: number;
  initialBalance?: number;
  clientId: string;
  //TODO DEFINIR UN INTERFAZ
  client?: IClientDetails;
  financialEntityId: string;
  financialEntity?: IFinancialEntity;
  createdAt: Date;
  updatedAt: Date;
  valueHistory?: IClientFinancialEntityValueHistory[];
}