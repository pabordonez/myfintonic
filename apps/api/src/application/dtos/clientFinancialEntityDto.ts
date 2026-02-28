export class CreateClientFinancialEntityDto {
  clientId!: string
  financialEntityId!: string
  balance!: number
  initialBalance!: number
}

export class UpdateClientFinancialEntityDto {
  balance?: number
}
