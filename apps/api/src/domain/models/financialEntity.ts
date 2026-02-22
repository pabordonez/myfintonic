export interface IFinancialEntity {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date | null
}

export class FinancialEntity implements IFinancialEntity {
  public id: string
  public name: string
  public createdAt: Date
  public updatedAt: Date | null

  private constructor(data: IFinancialEntity) {
    this.id = data.id
    this.name = data.name
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  // Factory para crear nuevas entidades (con validación)
  public static create(name: string, id: string): FinancialEntity {
    if (!name || name.trim().length === 0) {
      throw new Error('Financial Entity name is required')
    }

    return new FinancialEntity({
      id,
      name,
      createdAt: new Date(),
      updatedAt: null,
    })
  }

  // Factory para reconstituir desde base de datos
  public static fromPrimitives(data: IFinancialEntity): FinancialEntity {
    return new FinancialEntity(data)
  }

  public update(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Financial Entity name is required')
    }
    this.name = name
    this.updatedAt = new Date()
  }
}
