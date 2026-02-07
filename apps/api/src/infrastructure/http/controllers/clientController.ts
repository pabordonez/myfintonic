import { Request, Response } from 'express'
import { ClientUseCases } from '@application/useCases/clientUseCases'
import { toClientResponse } from '@infrastructure/http/mappers/clientMapper'

export class ClientController {
  constructor(private clientUseCases: ClientUseCases) {}

  async register(req: Request, res: Response) {
    try {
      const result = await this.clientUseCases.register(req.body)
      res.status(201).json(result)
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already in use') {
        res.status(409).json({ error: error.message })
      } else {
        res.status(400).json({ error: 'Registration failed' })
      }
    }
  }

  async getAll(req: Request, res: Response) {
    const user = (req as any).user

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' })
    }

    const clients = await this.clientUseCases.getClients()
    return res.status(200).json(clients.map(toClientResponse))
  }

  async getById(req: Request, res: Response) {
    const user = (req as any).user
    const { id } = req.params

    if (user.role !== 'ADMIN' && user.id !== id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const client = await this.clientUseCases.getClientById(id as string)
    if (!client) return res.status(404).json({ error: 'Client not found' })

    return res.status(200).json(toClientResponse(client))
  }

  async update(req: Request, res: Response) {
    const user = (req as any).user
    const { id } = req.params

    // Seguridad: Solo el propio usuario puede actualizar sus datos
    if (user.id !== id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const updatedClient = await this.clientUseCases.updateClient(
      id as string,
      req.body
    )
    return res.status(200).json(toClientResponse(updatedClient))
  }

  async changePassword(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { newPassword, currentPassword } = req.body
      const requestorRole = (req as any).user?.role
      const requestorId = (req as any).user?.id

      if (!newPassword) {
        return res.status(400).json({ error: 'New password is required' })
      }

      await this.clientUseCases.changePassword(
        id as string,
        newPassword,
        currentPassword,
        requestorRole,
        requestorId
      )
      res.status(204).send()
    } catch (error: any) {
      if (error.message.includes('Forbidden')) {
        return res.status(403).json({ error: error.message })
      }
      if (
        error.message.includes('Invalid') ||
        error.message.includes('required')
      ) {
        return res.status(400).json({ error: error.message })
      }
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message })
      }
      console.error(error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }
}
