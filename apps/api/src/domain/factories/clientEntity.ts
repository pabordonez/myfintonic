import { IClient } from '@domain/entities/IClient'
import { Role } from '@domain/types'

export class clientEntity implements IClient {
  public id: string
  public firstName: string
  public lastName: string
  public email: string
  public password!: string
  public nickname?: string
  public role: Role
  public createdAt: Date
  public updatedAt?: Date

  private constructor(data: Partial<IClient>) {
    this.id = data.id!
    this.firstName = data.firstName!
    this.lastName = data.lastName!
    this.email = data.email!
    this.password = data.password!
    this.nickname = data.nickname
    this.role = data.role || 'USER'
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt
  }

  public static create(
    data: Omit<IClient, 'id' | 'createdAt' | 'updatedAt'>,
    id: string
  ): clientEntity {
    if (!data.email) throw new Error('Email is required')
    if (!data.password) throw new Error('Password is required')

    return new clientEntity({
      ...data,
      id,
      createdAt: new Date(),
    })
  }

  public static fromPrimitives(data: any): clientEntity {
    return new clientEntity(data)
  }

  public update(data: Partial<Omit<IClient, 'id' | 'createdAt'>>): void {
    if (data.firstName) this.firstName = data.firstName
    if (data.lastName) this.lastName = data.lastName
    if (data.nickname) this.nickname = data.nickname
    if (data.email) this.email = data.email
    if (data.password) this.password = data.password
    this.updatedAt = new Date()
  }
}
