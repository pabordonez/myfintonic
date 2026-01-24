import { Router } from 'express';
import { FinancialEntityController } from '@infrastructure/http/controllers/financialEntityController';

export const createFinancialEntityRoutes = (controller: FinancialEntityController): Router => {
  const router = Router();

  router.post('/', controller.create);
  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  router.put('/:id', controller.update);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.delete);

  return router;
};