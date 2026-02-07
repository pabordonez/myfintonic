import { RegisterClientDto, UpdateClientDto } from '@application/dtos/clientDto'

// Definimos una interfaz parcial para el Cliente para evitar dependencias circulares o de infraestructura aquí
export interface IClientRepository {
  create(data: RegisterClientDto): Promise<any>
  findAll(): Promise<any[]>
  findById(id: string): Promise<any | null>
  findByEmail(email: string): Promise<any | null>
  update(id: string, data: UpdateClientDto): Promise<any>
}
