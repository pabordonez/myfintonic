export interface CreateFinancialEntityDto {
  name: string;
  clientId: string;
  balance?: number;
}

export interface UpdateFinancialEntityDto {
  name?: string;
  balance?: number;
}
