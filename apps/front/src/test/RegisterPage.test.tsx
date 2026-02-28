import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { BrowserRouter } from 'react-router-dom'
import { api } from '../config/api'

vi.mock('../config/api', () => ({
  api: {
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  },
}))

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders register form elements', () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Registro MyFintonic')).toBeInTheDocument()
    expect(screen.getByText(/Nombre/i)).toBeInTheDocument()
    expect(screen.getByText(/Apellido/i)).toBeInTheDocument()
    expect(screen.getByText(/Email/i)).toBeInTheDocument()
    expect(screen.getByText(/Password/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Registrarse/i })
    ).toBeInTheDocument()
  })

  it('submits registration form successfully', async () => {
    // Guardamos la implementación original para usarla con delay 0
    const originalSetTimeout = global.setTimeout
    vi.spyOn(global, 'setTimeout').mockImplementation((fn: any) => {
      return originalSetTimeout(fn, 0)
    })
    vi.mocked(api.post).mockResolvedValue({})

    const { container } = render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    )

    fireEvent.change(container.querySelector('input[name="firstName"]')!, {
      target: { value: 'John' },
    })
    fireEvent.change(container.querySelector('input[name="lastName"]')!, {
      target: { value: 'Doe' },
    })
    fireEvent.change(container.querySelector('input[name="email"]')!, {
      target: { value: 'john@test.com' },
    })
    fireEvent.change(container.querySelector('input[name="password"]')!, {
      target: { value: 'password123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }))

    // 1. Esperamos a que aparezca el mensaje de éxito. Esto confirma que la llamada a la API fue exitosa.
    await screen.findByText('Registro exitoso. Redirigiendo al login...')

    // 2. Verificamos que la API fue llamada correctamente.
    expect(api.post).toHaveBeenCalledWith('/auth/register', expect.any(Object))

    // 3. Verificamos que la navegación ocurrió (usamos waitFor porque setTimeout(0) es asíncrono)
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/auth/login')
    })
  })

  it('displays error on registration failure', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('Registration failed'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { container } = render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    )

    fireEvent.change(container.querySelector('input[name="firstName"]')!, {
      target: { value: 'John' },
    })
    fireEvent.change(container.querySelector('input[name="lastName"]')!, {
      target: { value: 'Doe' },
    })
    fireEvent.change(container.querySelector('input[name="email"]')!, {
      target: { value: 'john@test.com' },
    })
    fireEvent.change(container.querySelector('input[name="password"]')!, {
      target: { value: 'password123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/Error al registrar usuario/i)
      ).toBeInTheDocument()
    })
    consoleSpy.mockRestore()
  })

  it('displays validation errors for empty fields', async () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }))

    await waitFor(() => {
      expect(screen.getByText(/El nombre es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/El apellido es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/Email inválido/i)).toBeInTheDocument()
    })
  })
})
