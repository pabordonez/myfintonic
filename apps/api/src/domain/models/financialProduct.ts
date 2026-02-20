// src/domain/models/FinancialProduct.ts
import { IFinancialProduct } from '@domain/entities/IFinancialProduct'
import { ProductStatus, ProductType } from '@domain/types'
import { ITransactionPolicy } from '@domain/strategies/transactionPolicy'

export class FinancialProduct implements IFinancialProduct {
  // Propiedades requeridas por la interfaz
  public id?: string
  public type!: ProductType
  public name!: string
  public financialEntity!: string
  public status!: ProductStatus
  public clientId!: string
  public createdAt!: Date
  public updatedAt!: Date
  // ... resto de propiedades opcionales mapeadas ...

  private constructor(data: IFinancialProduct) {
    Object.assign(this, data)
  }

  // Factory Method para hidratar desde persistencia (Prisma -> Dominio)
  public static fromPrimitives(data: IFinancialProduct): FinancialProduct {
    return new FinancialProduct(data)
  }

  // --- LÓGICA DE NEGOCIO ---

  /**
   * Verifica si un usuario es el propietario del producto.
   * Reemplaza la lógica: if (product.clientId !== userId)
   */
  public isOwnedBy(userId: string): boolean {
    return this.clientId === userId
  }

  /**
   * Ejecuta la validación de transacción usando una estrategia inyectada.
   * La entidad delega la regla compleja a la estrategia.
   */
  public validateTransaction(policy: ITransactionPolicy): void {
    policy.validate(this)
  }
}
