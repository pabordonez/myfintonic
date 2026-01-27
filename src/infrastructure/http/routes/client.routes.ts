import { Router } from 'express'
import { ClientFinancialEntityController } from '@infrastructure/http/controllers/clientFinancialEntityController'

export const createClientRoutes = (controller: ClientFinancialEntityController): Router => {
  const router = Router()

  router.post('/:clientId/financial-entities', controller.create)
  router.get('/:clientId/financial-entities', controller.getAll)
  router.get('/:clientId/financial-entities/:id', controller.getById)
  router.put('/:clientId/financial-entities/:id', controller.updateBalance)

  router.delete('/:clientId/financial-entities/:id', controller.delete)



  return router
}