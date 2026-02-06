import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ChangePasswordPage } from '../features/clients/pages/ChangePasswordPage'
import axios from 'axios'
import { MemoryRouter } from 'react-router-dom'
import { API_URL } from '../config/api'

const { mockNavigate, mockUseParams, mockUseAuth } = vi.hoisted(() => {
  return {
    mockNavigate: vi.fn(),
    mockUseParams: vi.fn().mockReturnValue({ id: 'user-123' }),
    mockUseAuth: vi.fn(),
  }
})

vi.mock('axios')

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: mockUseParams,
  }
})

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('ChangePasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseParams.mockReturnValue({ id: 'user-123' })
  })

  it('renders form correctly for USER', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-123', role: 'USER' }, token: 'token' })
    render(
      <MemoryRouter>
        <ChangePasswordPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Cambiar Contraseña')).toBeInTheDocument()
    expect(screen.getByLabelText(/Contraseña Actual/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Nueva Contraseña/i)).toBeInTheDocument()
  })

  it('renders form correctly for ADMIN (no current password)', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'admin-1', role: 'ADMIN' }, token: 'token' })
    render(
      <MemoryRouter>
        <ChangePasswordPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Cambiar Contraseña')).toBeInTheDocument()
    expect(screen.queryByLabelText(/Contraseña Actual/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText(/Nueva Contraseña/i)).toBeInTheDocument()
  })

  it('submits form successfully for USER', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-123', role: 'USER' }, token: 'token' })
    vi.mocked(axios.put).mockResolvedValue({})

    render(
      <MemoryRouter>
        <ChangePasswordPage />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/Contraseña Actual/i), { target: { value: 'oldPass' } })
    fireEvent.change(screen.getByLabelText(/Nueva Contraseña/i), { target: { value: 'newPass' } })
    fireEvent.click(screen.getByText('Guardar Cambios'))

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        `${API_URL}/clients/user-123/change-password`,
        { currentPassword: 'oldPass', newPassword: 'newPass' },
        expect.any(Object)
      )
      expect(screen.getByText('Contraseña actualizada correctamente')).toBeInTheDocument()
    })
  })

  it('submits form successfully for ADMIN', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'admin-1', role: 'ADMIN' }, token: 'token' })
    vi.mocked(axios.put).mockResolvedValue({})

    render(
      <MemoryRouter>
        <ChangePasswordPage />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/Nueva Contraseña/i), { target: { value: 'newPassAdmin' } })
    fireEvent.click(screen.getByText('Guardar Cambios'))

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        `${API_URL}/clients/user-123/change-password`,
        { newPassword: 'newPassAdmin' },
        expect.any(Object)
      )
      expect(screen.getByText('Contraseña actualizada correctamente')).toBeInTheDocument()
    })
  })

  it('displays error message on failure', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-123', role: 'USER' }, token: 'token' })
    vi.mocked(axios.put).mockRejectedValue({
      response: { data: { error: 'Invalid password' } }
    })

    render(
      <MemoryRouter>
        <ChangePasswordPage />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/Contraseña Actual/i), { target: { value: 'wrong' } })
    fireEvent.change(screen.getByLabelText(/Nueva Contraseña/i), { target: { value: 'new' } })
    fireEvent.click(screen.getByText('Guardar Cambios'))

    await waitFor(() => {
      expect(screen.getByText('Invalid password')).toBeInTheDocument()
    })
  })

  it('navigates back when back button is clicked', () => {
    render(
      <MemoryRouter>
        <ChangePasswordPage />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByText('Volver'))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })
})