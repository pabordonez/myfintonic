import { IClientFinancialEntity } from '@domain/entities/IClientFinancialEntity'
import { IClientFinancialEntityValueHistory } from '@domain/entities/IClientFinancialEntityHistory'
import { IClientDetails } from '@domain/models/client'
import { IFinancialEntity } from '@domain/entities/IFinancialEntity'

export class ClientFinancialEntity implements IClientFinancialEntity {
  public id: string
  public balance: number
  public initialBalance?: number
  public clientId: string
  public financialEntityId: string
  public createdAt: Date
  public updatedAt: Date
  public client?: IClientDetails
  public financialEntity?: IFinancialEntity
  public valueHistory?: IClientFinancialEntityValueHistory[]

  private constructor(data: Partial<IClientFinancialEntity>) {
    this.id = data.id!
    this.balance = data.balance ?? 0
    this.initialBalance = data.initialBalance
    this.clientId = data.clientId!
    this.financialEntityId = data.financialEntityId!
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
    this.client = data.client
    this.financialEntity = data.financialEntity
    this.valueHistory = data.valueHistory || []
  }

  public static create(
    data: Omit<IClientFinancialEntity, 'id' | 'createdAt' | 'updatedAt'>,
    id: string
  ): ClientFinancialEntity {
    if (!data.clientId) throw new Error('Client ID is required')
    if (!data.financialEntityId)
      throw new Error('Financial Entity ID is required')

    return new ClientFinancialEntity({
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  public static fromPrimitives(data: any): ClientFinancialEntity {
    return new ClientFinancialEntity(data)
  }

  public updateBalance(newBalance: number): void {
    this.balance = newBalance
    this.updatedAt = new Date()
  }
}
