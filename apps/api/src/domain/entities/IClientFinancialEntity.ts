import { IFinancialEntity } from './IFinancialEntity'
import { IClientDetails } from '@domain/models/client'
import { IClientFinancialEntityValueHistory } from './IClientFinancialEntityHistory'

export interface IClientFinancialEntity {
  id: string
  balance: number
  initialBalance?: number
  clientId: string
  client?: IClientDetails
  financialEntityId: string
  financialEntity?: IFinancialEntity
  createdAt: Date
  updatedAt: Date
  valueHistory?: IClientFinancialEntityValueHistory[]
}
