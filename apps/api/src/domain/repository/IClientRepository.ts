import { IClient } from '@domain/entities/IClient'
export interface IClientRepository {
  create(data: Partial<IClient>): Promise<any>
  findAll(): Promise<any[]>
  findById(id: string): Promise<any | null>
  findByEmail(email: string): Promise<any | null>
  update(id: string, data: Partial<IClient>): Promise<any>
}
