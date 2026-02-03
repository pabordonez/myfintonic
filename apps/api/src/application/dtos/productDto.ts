import { ProductStatus, ProductType } from '../../domain/types'

export interface CreateProductDto {
  type: ProductType
  name: string
  financialEntity: string
  status: ProductStatus
  clientId?: string
  //TODO DEFINIR MAS ESPECIFICAMENTE SEGUN EL TIPO
  [key: string]: any
}

export interface UpdateProductDto {
  name?: string
  status?: ProductStatus
  //TODO DEFINIR MAS ESPECIFICAMENTE SEGUN EL TIPO
  [key: string]: any
}
