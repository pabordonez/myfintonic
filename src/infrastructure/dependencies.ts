import { PrismaProductRepository } from './persistence/PrismaProductRepository';
import { PrismaFinancialEntityRepository } from './persistence/PrismaFinancialEntityRepository';
import { ProductUseCases } from '../application/useCases/productUseCases';
import { FinancialEntityUseCases } from '../application/useCases/financialEntityUseCases';
import { ProductController } from './http/controllers/productController';
import { FinancialEntityController } from './http/controllers/financialEntityController';
import { HealthController } from './http/controllers/healthController';
import { ProductFactory } from '../domain/factories/productFactory';

export const productRepository = new PrismaProductRepository();
export const financialEntityRepository = new PrismaFinancialEntityRepository();

const productFactory = new ProductFactory();
const productUseCases = new ProductUseCases(productRepository, productFactory);
const financialEntityUseCases = new FinancialEntityUseCases(financialEntityRepository);

export const productController = new ProductController(productUseCases);
export const financialEntityController = new FinancialEntityController(financialEntityUseCases);
export const healthController = new HealthController();