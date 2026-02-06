import { Router } from 'express'
import { FinancialEntityController } from '@infrastructure/http/controllers/financialEntityController'
import { authenticate } from '../middlewares/authenticate'
import { isAdmin } from '../middlewares/isAdmin'

export const createFinancialEntityRoutes = (controller: FinancialEntityController): Router => {
  const router = Router()

  router.use(authenticate)

  router.post('/', isAdmin, controller.create)
  router.get('/', controller.getAll)
  router.get('/:id', controller.getById)
  router.put('/:id', isAdmin, controller.update)
  router.patch('/:id', isAdmin, controller.update)
  router.delete('/:id', isAdmin, controller.delete)

  return router
}
