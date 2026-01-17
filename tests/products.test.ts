import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../src/app';

describe('Financial Products API', () => {
  // Datos de prueba base
  const baseProduct = {
    type: 'CURRENT_ACCOUNT',
    name: 'Cuenta Nómina Test',
    financialEntity: 'Banco de Pruebas',
    status: 'ACTIVE',
    clientId: '550e8400-e29b-41d4-a716-446655440000',
    currentBalance: 1000.50
  };

  let productId: string;

  beforeEach(async () => {
    const response = await request(app).post('/products').send(baseProduct);
    productId = response.body?.id || 'dummy-id';
  });

  describe('GET /products', () => {
    it('should return 200 and a list of products', async () => {
      const response = await request(app).get('/products');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should allow filtering by status', async () => {
      // Creamos un producto inactivo para probar el filtro
      const inactiveProduct = { ...baseProduct, status: 'INACTIVE', name: 'Inactive Product' };
      await request(app).post('/products').send(inactiveProduct);

      const response = await request(app).get('/products?status=INACTIVE');
      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.every((p: any) => p.status === 'INACTIVE')).toBe(true);
    });

    it('should allow filtering by type', async () => {
      const investmentFund = {
        ...baseProduct,
        type: 'INVESTMENT_FUND',
        name: 'My Fund'
      };
      await request(app).post('/products').send(investmentFund);

      const response = await request(app).get('/products?type=INVESTMENT_FUND');
      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.every((p: any) => p.type === 'INVESTMENT_FUND')).toBe(true);
    });

    it('should allow filtering by financialEntity', async () => {
      const otherBankProduct = { ...baseProduct, financialEntity: 'Global Bank', name: 'Global Account' };
      await request(app).post('/products').send(otherBankProduct);

      const response = await request(app).get('/products?financialEntity=Global Bank');
      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.every((p: any) => p.financialEntity === 'Global Bank')).toBe(true);
    });
  });

  describe('POST /products', () => {
    it('should return 201 and the created product on valid input', async () => {
      const response = await request(app)
        .post('/products')
        .send(baseProduct);
      
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(baseProduct);
      expect(response.body).toHaveProperty('id');
    });

    it('should return 400 on invalid input (missing required fields)', async () => {
      const invalidProduct = { name: 'Incomplete Product' };
      const response = await request(app)
        .post('/products')
        .send(invalidProduct);
      
      expect(response.status).toBe(400);
    });
  });

  describe('GET /products/:id', () => {
    it('should return 200 and the product if found', async () => {
      const response = await request(app).get(`/products/${productId}`);
      
      // En la fase inicial de TDD, esto fallará con 404
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', productId);
    });

    it('should return 404 if product not found', async () => {
      const response = await request(app).get('/products/non-existent-id');
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /products/:id', () => {
    it('should return 204 on successful update', async () => {
      const updatedProduct = { ...baseProduct, name: 'Updated Name' };
      const response = await request(app).put(`/products/${productId}`).send(updatedProduct);
      
      expect(response.status).toBe(204);
    });
  });

  describe('PATCH /products/:id', () => {
    it('should return 204 and update status', async () => {
      const response = await request(app)
        .patch(`/products/${productId}`)
        .send({ status: 'PAUSED' });
      
      expect(response.status).toBe(204);

      const getResponse = await request(app).get(`/products/${productId}`);
      expect(getResponse.body.status).toBe('PAUSED');
    });

    it('should return 404 if product not found', async () => {
      const response = await request(app).patch('/products/non-existent-id').send({ status: 'PAUSED' });
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /products/:id', () => {
    it('should return 204 on successful deletion', async () => {
      const response = await request(app).delete(`/products/${productId}`);
      expect(response.status).toBe(204);
    });
  });
});