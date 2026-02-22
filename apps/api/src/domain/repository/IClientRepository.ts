import { clientEntity } from '@domain/factories/clientEntity'

export interface IClientRepository {
  create(client: clientEntity): Promise<clientEntity>
  findAll(): Promise<clientEntity[]>
  findById(id: string): Promise<clientEntity | null>
  findByEmail(email: string): Promise<clientEntity | null>
  update(client: clientEntity): Promise<clientEntity>
}
