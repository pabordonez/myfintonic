import { PrismaProductRepository } from '@infrastructure/persistence/PrismaProductRepository';
import { PrismaFinancialEntityRepository } from '@infrastructure/persistence/PrismaFinancialEntityRepository';
import { ProductUseCases } from '@application/useCases/productUseCases';
import { FinancialEntityUseCases } from '@application/useCases/financialEntityUseCases';
import { ProductController } from '@infrastructure/http/controllers/productController';
import { FinancialEntityController } from '@infrastructure/http/controllers/financialEntityController';
import { HealthController } from '@infrastructure/http/controllers/healthController';
import { ProductFactory } from '@domain/factories/productFactory';

export const productRepository = new PrismaProductRepository();

const productFactory = new ProductFactory();
const productUseCases = new ProductUseCases(productRepository, productFactory);
export const productController = new ProductController(productUseCases);

export const financialEntityRepository = new PrismaFinancialEntityRepository();
const financialEntityUseCases = new FinancialEntityUseCases(financialEntityRepository);
export const financialEntityController = new FinancialEntityController(financialEntityUseCases);

export const healthController = new HealthController();