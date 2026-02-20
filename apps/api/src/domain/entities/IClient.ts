export interface IClient {
  firstName: string
  lastName: string
  email: string
  password: string
  nickname?: string
  role: 'ADMIN' | 'USER'
  createdAt: Date
  updatedAt?: Date
}
export interface IClientUpdate {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  nickname?: string
  updatedAt: Date
}

export interface IClientDetails {
  id: string
  firstName: string
  lastName: string
  email: string
  nickname?: string
}
