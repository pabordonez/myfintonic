import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'

vi.mock('axios')
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
    expect(screen.getByRole('button', { name: /Registrarse/i })).toBeInTheDocument()
  })

  it('submits registration form successfully', async () => {
    vi.mocked(axios.post).mockResolvedValue({})
    vi.spyOn(window, 'alert').mockImplementation(() => {})

    const { container } = render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    )

    fireEvent.change(container.querySelector('input[name="firstName"]')!, { target: { value: 'John' } })
    fireEvent.change(container.querySelector('input[name="lastName"]')!, { target: { value: 'Doe' } })
    fireEvent.change(container.querySelector('input[name="email"]')!, { target: { value: 'john@test.com' } })
    fireEvent.change(container.querySelector('input[name="password"]')!, { target: { value: 'password123' } })

    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }))

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/auth/register'), expect.any(Object))
      expect(mockNavigate).toHaveBeenCalledWith('/auth/login')
    })
  })

  it('displays error on registration failure', async () => {
    vi.mocked(axios.post).mockRejectedValue(new Error('Registration failed'))

    const { container } = render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    )

    fireEvent.change(container.querySelector('input[name="firstName"]')!, { target: { value: 'John' } })
    fireEvent.change(container.querySelector('input[name="lastName"]')!, { target: { value: 'Doe' } })
    fireEvent.change(container.querySelector('input[name="email"]')!, { target: { value: 'john@test.com' } })
    fireEvent.change(container.querySelector('input[name="password"]')!, { target: { value: 'password123' } })

    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }))

    await waitFor(() => {
      expect(screen.getByText(/Error al registrar usuario/i)).toBeInTheDocument()
    })
  })

  it('displays validation errors for empty fields', async () => {
    const { container } = render(
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