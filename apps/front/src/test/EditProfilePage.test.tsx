import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EditProfilePage } from '../features/profile/pages/EditProfilePage'
import { BrowserRouter } from 'react-router-dom'
import { updateClientProfile } from '../features/profile/services/client.service'
import { useAuth } from '../hooks/useAuth'

vi.mock('../features/profile/services/client.service')
vi.mock('../hooks/useAuth')

const { mockNavigate } = vi.hoisted(() => {
  return { mockNavigate: vi.fn() }
})

const mockRefreshUser = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('EditProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(useAuth as any).mockReturnValue({
      user: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
      },
      token: 'token',
      refreshUser: mockRefreshUser,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders form with user data', () => {
    render(
      <BrowserRouter>
        <EditProfilePage />
      </BrowserRouter>
    )

    expect(screen.getByDisplayValue('John')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
  })

  it('updates profile successfully', async () => {
    const originalSetTimeout = global.setTimeout
    const setTimeoutSpy = vi
      .spyOn(global, 'setTimeout')
      .mockImplementation((fn: any, delay?: number) => {
        if (delay === 1500) {
          fn()
          return 0 as any
        }
        return originalSetTimeout(fn, delay)
      })
    vi.mocked(updateClientProfile).mockResolvedValue({
      id: '1',
      firstName: 'Jane',
      lastName: 'Doe',
    })

    const { container } = render(
      <BrowserRouter>
        <EditProfilePage />
      </BrowserRouter>
    )

    fireEvent.change(container.querySelector('input[name="firstName"]')!, {
      target: { value: 'Jane' },
    })
    fireEvent.click(screen.getByText('Guardar Cambios'))

    await waitFor(() => {
      expect(updateClientProfile).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({ firstName: 'Jane' })
      )
      expect(mockRefreshUser).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })

    setTimeoutSpy.mockRestore()
  })

  it('displays error on update failure', async () => {
    vi.mocked(updateClientProfile).mockRejectedValue(new Error('Update failed'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <BrowserRouter>
        <EditProfilePage />
      </BrowserRouter>
    )

    fireEvent.click(screen.getByText('Guardar Cambios'))

    await waitFor(() => {
      expect(
        screen.getByText('No se pudo actualizar el perfil. Inténtalo de nuevo.')
      ).toBeInTheDocument()
    })
    consoleSpy.mockRestore()
  })

  it('redirects to login if user is missing', async () => {
    ;(useAuth as any).mockReturnValue({
      user: null,
      token: null, // Aseguramos que ambos sean null
      refreshUser: mockRefreshUser,
    })

    render(
      <BrowserRouter>
        <EditProfilePage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/auth/login')
    })
  })

  it('navigates back when back button is clicked', () => {
    const { container } = render(
      <BrowserRouter>
        <EditProfilePage />
      </BrowserRouter>
    )
    const backButton = container.querySelector('button')
    fireEvent.click(backButton!)
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('renders change password link', () => {
    render(
      <BrowserRouter>
        <EditProfilePage />
      </BrowserRouter>
    )

    const changePasswordLink = screen.getByText('Cambiar Contraseña')
    expect(changePasswordLink).toBeInTheDocument()
    expect(changePasswordLink.closest('a')).toHaveAttribute(
      'href',
      '/clients/1/change-password'
    )
  })
})
