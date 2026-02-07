import { Request, Response } from 'express'

export class HealthController {
  run = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ status: 'UP' })
  }
}
