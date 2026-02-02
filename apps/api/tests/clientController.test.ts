import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { ClientController } from '../src/infrastructure/http/controllers/ClientController';
import { ClientUseCases } from '../src/application/useCases/ClientUseCases';

// Mock de dependencias
vi.mock('@application/useCases/clientUseCases');

describe('ClientController', () => {
  let controller: ClientController;
  let useCases: ClientUseCases;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: any;
  let status: any;

  beforeEach(() => {
    useCases = new ClientUseCases({} as any);
    controller = new ClientController(useCases);
    json = vi.fn();
    status = vi.fn().mockReturnValue({ json });
    res = { status: status } as unknown as Response;
  });

  describe('register', () => {
    it('should create a new client and return 201', async () => {
      const registerDto = {
        email: 'new@test.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User'
      };
      const createdClient = { id: 'new-id', ...registerDto, role: 'USER' };

      vi.mocked(useCases.register = vi.fn()).mockResolvedValue(createdClient);

      req = { body: registerDto };
      await controller.register(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith(createdClient);
      expect(useCases.register).toHaveBeenCalledWith(registerDto);
    });
  });

  it('should return 403 Forbidden if user is not ADMIN', async () => {
    req = {
      user: { id: 'user-1', role: 'USER' }
    } as any;

    await controller.getAll(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({ error: 'Access denied' });
  });

  it('should return 200 and list of clients if user is ADMIN', async () => {
    req = {
      user: { id: 'admin-1', role: 'ADMIN' }
    } as any;
    
    const mockClients = [{ id: '1', email: 'test@test.com', role: 'USER' }];
    vi.mocked(useCases.getClients).mockResolvedValue(mockClients as any);

    await controller.getAll(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(mockClients);
  });

  describe('update', () => {
    it('should return 403 if user tries to update another client profile', async () => {
      req = {
        user: { id: 'user-1', role: 'USER' },
        params: { id: 'user-2' }, // ID diferente al del token
        body: { firstName: 'Hacker' }
      } as any;

      // Asumimos que el método existirá
      await controller.update(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(403);
      expect(json).toHaveBeenCalledWith({ error: 'Access denied' });
    });

    it('should update client data successfully if user is owner', async () => {
      const clientId = 'user-1';
      const updateData = { firstName: 'Updated Name', lastName: 'New Lastname' };
      
      req = {
        user: { id: clientId, role: 'USER' },
        params: { id: clientId }, // Mismo ID
        body: updateData
      } as any;

      const updatedClient = { id: clientId, ...updateData, email: 'test@test.com' };
      
      // Mockeamos la respuesta del caso de uso (que implementaremos luego)
      vi.mocked(useCases.updateClient = vi.fn()).mockResolvedValue(updatedClient);

      await controller.update(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(updatedClient);
      expect(useCases.updateClient).toHaveBeenCalledWith(clientId, updateData);
    });
  });
});