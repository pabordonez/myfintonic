export interface CreateClientFinancialEntityDto {
  clientId: string
  financialEntityId: string
  balance?: number
}

export interface UpdateClientFinancialEntityDto {
  balance?: number
}