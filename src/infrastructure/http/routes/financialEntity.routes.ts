import { Router } from 'express'
import { FinancialEntityController } from '@infrastructure/http/controllers/financialEntityController'
import { ClientFinancialEntityController } from '@infrastructure/http/controllers/clientFinancialEntityController'

export const createFinancialEntityRoutes = (controller: FinancialEntityController,ClientFinancialEntityController: ClientFinancialEntityController): Router => {
  const router = Router()

  router.post('/', controller.create)
  router.get('/', controller.getAll)
  router.get('/:id', controller.getById)
  router.put('/:id', controller.update)
  router.patch('/:id', controller.update)
  router.delete('/:id', controller.delete)

  
  
  // Rutas para la relación Cliente-Entidad (ClientFinancialEntity)
  router.post('/:id/client', ClientFinancialEntityController.create)
  router.get('/:id/client/:id', ClientFinancialEntityController.getById)
  router.get('/:id/client', ClientFinancialEntityController.getAll)
  router.put('/:id/client/:id', ClientFinancialEntityController.updateBalance)

  return router
}
