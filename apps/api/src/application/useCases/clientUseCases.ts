import { ClientRepository } from '@domain/IClientRepository';
import { RegisterClientDto, UpdateClientDto } from '@application/dtos/client.dto';
import { hash } from 'bcrypt';

export class ClientUseCases {
  constructor(private clientRepository: ClientRepository) {}

  async register(data: RegisterClientDto) {
    const hashedPassword = await hash(data.password, 10);
    const clientData = { ...data, password: hashedPassword };
    return this.clientRepository.create(clientData);
  }

  async getClients() {
    return this.clientRepository.findAll();
  }

  async updateClient(id: string, data: UpdateClientDto) {
    // Aquí podrían ir validaciones de negocio adicionales antes de guardar
    return this.clientRepository.update(id, data);
  }

  async getClientById(id: string) {
    return this.clientRepository.findById(id);
  }
}