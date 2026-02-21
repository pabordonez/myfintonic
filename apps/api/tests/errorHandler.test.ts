import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { errorHandler } from '../src/infrastructure/http/middlewares/errorHandler'

describe('errorHandler Middleware', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let next: NextFunction
  let json: any
  let status: any

  beforeEach(() => {
    req = { method: 'GET', url: '/test' }
    json = vi.fn()
    status = vi.fn().mockReturnValue({ json })
    res = { status, json } as unknown as Response
    next = vi.fn()
    // Silenciar console.error para mantener limpios los logs de los tests
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should handle ZodError with 400', () => {
    const error = new z.ZodError([
      { code: 'custom', path: ['field'], message: 'Invalid' },
    ])
    errorHandler(error, req as Request, res as Response, next)
    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Validation Error',
        details: expect.any(Array),
      })
    )
  })

  it('should handle conflict errors (already exists) with 409', () => {
    const error = new Error('Email already in use')
    errorHandler(error, req as Request, res as Response, next)
    expect(status).toHaveBeenCalledWith(409)
    expect(json).toHaveBeenCalledWith({ error: 'Email already in use' })
  })

  it('should handle authentication errors (Invalid credentials) with 401', () => {
    const error = new Error('Invalid credentials')
    errorHandler(error, req as Request, res as Response, next)
    expect(status).toHaveBeenCalledWith(401)
    expect(json).toHaveBeenCalledWith({ error: 'Invalid credentials' })
  })

  it('should handle domain validation errors (Missing required) with 400', () => {
    const error = new Error('Missing required fields')
    errorHandler(error, req as Request, res as Response, next)
    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith({ error: 'Missing required fields' })
  })

  it('should handle not found errors with 404', () => {
    const error = new Error('Product not found')
    errorHandler(error, req as Request, res as Response, next)
    expect(status).toHaveBeenCalledWith(404)
    expect(json).toHaveBeenCalledWith({ error: 'Product not found' })
  })

  it('should handle security errors (Forbidden) with 403', () => {
    const error = new Error('Forbidden access')
    errorHandler(error, req as Request, res as Response, next)
    expect(status).toHaveBeenCalledWith(403)
    expect(json).toHaveBeenCalledWith({ error: 'Forbidden access' })
  })

  it('should handle unexpected errors with 500', () => {
    const error = new Error('Boom')
    errorHandler(error, req as Request, res as Response, next)
    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({ error: 'Internal Server Error' })
  })
})
