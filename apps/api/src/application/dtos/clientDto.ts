export interface RegisterClientDto {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'USER'
  nickname?: string
}

export interface UpdateClientDto {
  firstName?: string
  lastName?: string
  nickname?: string
  password: string
}
