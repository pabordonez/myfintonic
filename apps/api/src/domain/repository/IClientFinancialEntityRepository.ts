import { ClientFinancialEntity } from '@domain/factories/clientFinancialEntity'

export interface IClientFinancialEntityRepository {
  findAll(filters?: {
    clientId?: string
    financialEntityId?: string
    name?: string
  }): Promise<ClientFinancialEntity[]>
  findById(id: string): Promise<ClientFinancialEntity | null>
  findAllWithClients(): Promise<ClientFinancialEntity[]>
  create(entity: ClientFinancialEntity): Promise<ClientFinancialEntity>
  update(entity: ClientFinancialEntity): Promise<void>
  delete(id: string): Promise<void>
}
