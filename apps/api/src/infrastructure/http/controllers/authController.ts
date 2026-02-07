import { Request, Response } from 'express'
import { AuthUseCases } from '@application/useCases/authUseCases'
import { env } from '@config/env'

export class AuthController {
  constructor(private useCases: AuthUseCases) {}

  login = async (req: Request, res: Response) => {
    try {
      const { token, user } = await this.useCases.login(req.body)

      res.cookie('token', token, {
        httpOnly: true,
        // En producción, como Front y Back están en dominios distintos (Vercel vs Render),
        // necesitamos 'none' y secure: true para que la cookie viaje.
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: env.COOKIE_MAX_AGE,
      })

      res.status(200).json({ token, user })
    } catch (error: any) {
      res.status(401).json({ error: error.message || 'Invalid credentials' })
    }
  }

  logout = async (req: Request, res: Response) => {
    res.cookie('token', '', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 0, // Expire immediately
    })
    res.status(200).json({ message: 'Logged out successfully' })
  }
}
