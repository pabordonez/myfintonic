import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { BrowserRouter } from 'react-router-dom'

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
    global.fetch = vi.fn()
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
    // Mock successful fetch response
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: 'header.eyJpZCI6InVzZXItMTIzIn0.signature',
        }),
      })
      .mockResolvedValueOnce({
        // Second fetch for user profile
        ok: true,
        json: async () => ({ id: 'user-123', role: 'USER' }),
      })
    global.fetch = mockFetch

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
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({ method: 'POST' })
      )
      expect(mockLogin).toHaveBeenCalled() // refreshUser
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('displays error on login failure', async () => {
    // Mock failed fetch response
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    })

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
      expect(global.fetch).toHaveBeenCalled()
      expect(screen.getByText(/Credenciales inválidas/i)).toBeInTheDocument()
    })
  })
})
