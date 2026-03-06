export class RegisterClientDto {
  email!: string
  password!: string
  firstName!: string
  lastName!: string
  role!: 'ADMIN' | 'USER'
  nickname?: string
}

export class UpdateClientDto {
  firstName?: string
  lastName?: string
  nickname?: string
  password!: string
}
