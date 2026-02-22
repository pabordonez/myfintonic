import { Client } from '@domain/models/client'

export interface IClientRepository {
  create(client: Client): Promise<Client>
  findAll(): Promise<Client[]>
  findById(id: string): Promise<Client | null>
  findByEmail(email: string): Promise<Client | null>
  update(client: Client): Promise<Client>
}
