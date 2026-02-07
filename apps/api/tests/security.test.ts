import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

describe('Security Middlewares', () => {
  describe('CORS', () => {
    it('should allow requests from whitelisted origins (e.g. localhost:3000)', async () => {
      const origin = 'http://localhost:3000'
      const response = await request(app).get('/health').set('Origin', origin)

      expect(response.headers['access-control-allow-origin']).toBe(origin)
    })

    it('should block requests from non-whitelisted origins', async () => {
      const origin = 'http://evil-site.com'
      const response = await request(app).get('/health').set('Origin', origin)

      // El middleware de cors lanza un error, Express por defecto devuelve 500 con el mensaje
      expect(response.status).toBe(500)
      expect(response.text).toContain('Not allowed by CORS')
    })

    it('should allow requests with no origin (like curl or Postman)', async () => {
      const response = await request(app).get('/health')
      expect(response.status).toBe(200)
    })
  })

  describe('Helmet', () => {
    it('should set security headers', async () => {
      const response = await request(app).get('/health')

      expect(response.headers['x-dns-prefetch-control']).toBe('off')
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN')
      expect(response.headers['strict-transport-security']).toBeUndefined()
      expect(response.headers['x-content-type-options']).toBe('nosniff')
    })

    it('should hide X-Powered-By header', async () => {
      const response = await request(app).get('/health')
      expect(response.headers['x-powered-by']).toBeUndefined()
    })
  })
})
