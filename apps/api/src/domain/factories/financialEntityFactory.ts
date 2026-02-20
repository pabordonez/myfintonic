import { IFinancialEntity } from '@domain/entities/IFinancialEntity'

export class financialEntityFactory implements Partial<IFinancialEntity> {
  public name: string
  public createdAt: Date
  public updatedAt: Date | null

  private constructor(name: string, createdAt: Date) {
    this.name = name
    this.createdAt = createdAt
    this.updatedAt = null
  }

  public static create(name: string) {
    return new financialEntityFactory(name, new Date())
  }
}
