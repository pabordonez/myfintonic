import { Request, Response, NextFunction } from 'express'
import { AuthUseCases } from '@application/useCases/authUseCases'
import { env } from '@infrastructure/config/env'

export class AuthController {
  constructor(private useCases: AuthUseCases) {}

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, user } = await this.useCases.login(req.body)

      res.cookie('token', token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: env.COOKIE_MAX_AGE,
        path: '/',
      })

      res.status(200).json({ token, user })
    } catch (error) {
      next(error)
    }
  }

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie('token', '', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 0,
        path: '/',
      })
      res.status(200).json({ message: 'Logged out successfully' })
    } catch (error) {
      next(error)
    }
  }
}
