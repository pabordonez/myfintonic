import { Router } from 'express'
import { HealthController } from '@infrastructure/http/controllers/healthController'

export const createHealthRouter = (healthController: HealthController): Router => {
  const router = Router()
  router.get('/', healthController.run)
  return router
}
