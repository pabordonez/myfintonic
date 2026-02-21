// src/domain/models/financialProduct.ts
import { IFinancialProduct } from '@domain/entities/IFinancialProduct'
import { ProductStatus, ProductType } from '@domain/types'
import { ITransactionPolicy } from '@domain/strategies/transactionPolicy'

export abstract class FinancialProduct implements IFinancialProduct {
  public id?: string
  public type!: ProductType
  public name!: string
  public financialEntity!: string
  public financialEntityName?: string
  public status!: ProductStatus
  public clientId!: string
  public createdAt!: Date
  public updatedAt!: Date
  public valueHistory?: Array<{ date: Date; value: number }>

  protected constructor(data: Partial<IFinancialProduct>) {
    this.id = data.id
    this.type = data.type!
    this.name = data.name!
    this.financialEntity = data.financialEntity!
    this.financialEntityName = data.financialEntityName
    this.status = data.status!
    this.clientId = data.clientId!
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
    this.valueHistory = data.valueHistory || []
  }

  public isOwnedBy(userId: string): boolean {
    return this.clientId === userId
  }

  public validateTransaction(policy: ITransactionPolicy): void {
    policy.validate(this)
  }

  public abstract getAllowedUpdateFields(): string[]

  // Abstract method to avoid circular dependency with Factory
  protected abstract createCopy(data: any): FinancialProduct

  protected getCommonUpdateFields(): string[] {
    return ['name', 'status', 'financialEntity', 'clientId']
  }

  public update(data: any): FinancialProduct {
    if (!data) throw new Error('No data provided for update')

    const allowedFields = this.getAllowedUpdateFields()
    const receivedFields = Object.keys(data)
    const invalidFields = receivedFields.filter(
      (field) => !allowedFields.includes(field)
    )

    if (invalidFields.length > 0) {
      throw new Error(
        `Validation failed: Field(s) '${invalidFields.join(', ')}' cannot be updated for product type ${this.type}`
      )
    }

    const updatedData = {
      ...this,
      ...data,
      updatedAt: new Date(),
    }

    return this.createCopy(updatedData)
  }
}
