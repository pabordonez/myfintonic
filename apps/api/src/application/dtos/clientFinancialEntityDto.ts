export interface CreateClientFinancialEntityDto {
  clientId: string
  financialEntityId: string
  balance?: number
  initialBalance?: number
}

export interface UpdateClientFinancialEntityDto {
  balance?: number
}