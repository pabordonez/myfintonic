import { Request, Response } from 'express'
import { AuthUseCases } from '@application/useCases/authUseCases'

export class AuthController {
  constructor(private useCases: AuthUseCases) {}

  login = async (req: Request, res: Response) => {
    try {
      const result = await this.useCases.login(req.body)
      res.status(200).json(result)
    } catch {
      res.status(401).json({ error: 'Invalid credentials' })
    }
  }
}
