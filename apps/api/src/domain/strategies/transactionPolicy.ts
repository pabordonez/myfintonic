import { FinancialProduct } from '@domain/factories/financialProduct/financialProduct'

export interface ITransactionPolicy {
  validate(product: FinancialProduct): void
}

export class BankingTransactionPolicy implements ITransactionPolicy {
  validate(product: FinancialProduct): void {
    // Las cuentas bancarias permiten transacciones.
    // Aquí podríamos añadir más reglas (ej: verificar si está activa o bloqueada)
    if (product.status !== 'ACTIVE') {
      throw new Error('Transaction failed: Product is not active')
    }
  }
}

export class InvestmentTransactionPolicy implements ITransactionPolicy {
  validate(product: FinancialProduct): void {
    // Los productos de inversión no permiten transacciones manuales directas en este flujo
    throw new Error(
      `Transactions are not allowed for product type: ${product.type}`
    )
  }
}
