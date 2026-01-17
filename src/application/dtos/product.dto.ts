import { ProductStatus, ProductType } from '../../domain/types';

export interface CreateProductDto {
  type: ProductType;
  name: string;
  financialEntity: string;
  status: ProductStatus;
  clientId?: string;
  [key: string]: any;
}

export interface UpdateProductDto {
  name?: string;
  status?: ProductStatus;
  [key: string]: any;
}