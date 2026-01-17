import { InMemoryProductRepository } from './persistence/inMemoryProductRepository';
import { ProductUseCases } from '../application/useCases/productUseCases';
import { ProductController } from './http/controllers/productController';
import { HealthController } from './http/controllers/healthController';
import { ProductFactory } from '../domain/factories/product.factory';

const productRepository = new InMemoryProductRepository();
const productFactory = new ProductFactory();
const productUseCases = new ProductUseCases(productRepository, productFactory);

export const productController = new ProductController(productUseCases);
export const healthController = new HealthController();