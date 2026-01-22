export interface IFinancialEntity {
  id: string;
  name: string;
  balance?: number | null;
  clientId: string;
  createdAt?: Date;
  updatedAt?: Date;
  valueHistory?: { date: Date; value: number }[];
}