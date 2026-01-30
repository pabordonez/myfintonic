import { Request, Response } from 'express'
import { AuthUseCases } from '@application/useCases/authUseCases'

export class AuthController {
  constructor(private useCases: AuthUseCases) {}

  register = async (req: Request, res: Response) => {
    try {
      const result = await this.useCases.register(req.body)
      res.status(201).json(result)
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already in use') {
        res.status(409).json({ error: error.message })
      } else {
        res.status(400).json({ error: 'Registration failed' })
      }
    }
  }

  login = async (req: Request, res: Response) => {
    try {
      const result = await this.useCases.login(req.body)
      res.status(200).json(result)
    } catch {
      res.status(401).json({ error: 'Invalid credentials' })
    }
  }
}