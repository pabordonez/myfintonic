import { IClient, IClientUpdate } from '@domain/entities/IClient'

export interface IClientFactory {
  create(data: Omit<IClient, 'id'>): Omit<IClient, 'id'>
  update(data: Partial<IClient>): Partial<IClient>
}

export class ClientFactory implements IClientFactory {
  create(data: Omit<IClient, 'id'>): Omit<IClient, 'id'> {
    return {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      nickname: data.nickname,
      role: data.role,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    }
  }
  update(data: Partial<IClientUpdate>): Partial<IClientUpdate> {
    const result: Partial<IClientUpdate> = {}
    if (data.id !== undefined) result.id = data.id
    if (data.firstName !== undefined) result.firstName = data.firstName
    if (data.lastName !== undefined) result.lastName = data.lastName
    if (data.email !== undefined) result.email = data.email
    if (data.password !== undefined) result.password = data.password
    if (data.nickname !== undefined) result.nickname = data.nickname
    if (data.updatedAt !== undefined) result.updatedAt = data.updatedAt
    return result
  }
}
