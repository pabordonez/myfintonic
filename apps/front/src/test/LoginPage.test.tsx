import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { BrowserRouter } from 'react-router-dom'
import { authService } from '../features/auth/services/auth.service'
import { getClientById } from '../features/profile/services/client.service'

vi.mock('../features/auth/services/auth.service')
vi.mock('../features/profile/services/client.service')

// Hoist mocks to ensure stable references
const { mockLogin, mockNavigate } = vi.hoisted(() => {
  return {
    mockLogin: vi.fn(), // This is refreshUser in the component
    mockNavigate: vi.fn(),
  }
})

// The component uses refreshUser from useAuth, not login
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ refreshUser: mockLogin }),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form elements', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    expect(screen.getByText('MyFintonic Login')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /iniciar sesión/i })
    ).toBeInTheDocument()
  })

  it('calls login on form submit', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      token: 'token',
      user: { id: 'user-123' },
    })
    vi.mocked(getClientById).mockResolvedValue({ id: 'user-123', role: 'USER' })

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: 'test@test.com' },
    })
    fireEvent.change(screen.getByPlaceholderText(/Contraseña/i), {
      target: { value: 'Password123!' },
    })
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalled()
      expect(getClientById).toHaveBeenCalledWith('user-123')
      expect(mockLogin).toHaveBeenCalled() // refreshUser
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('displays error on login failure', async () => {
    // Mock failed fetch response
    vi.mocked(authService.login).mockRejectedValue(
      new Error('Credenciales inválidas')
    )

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: 'test@test.com' },
    })
    fireEvent.change(screen.getByPlaceholderText(/Contraseña/i), {
      target: { value: 'Password123!' },
    })
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(screen.getByText(/Credenciales inválidas/i)).toBeInTheDocument()
    })
  })

  it('displays default error message on login failure without message', async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error()) // Error sin mensaje

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: 'test@test.com' },
    })
    fireEvent.change(screen.getByPlaceholderText(/Contraseña/i), {
      target: { value: '123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(screen.getByText('Error al iniciar sesión')).toBeInTheDocument()
    })
  })
})
