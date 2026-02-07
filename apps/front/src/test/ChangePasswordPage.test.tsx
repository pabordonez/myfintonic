import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChangePasswordPage } from '../features/clients/pages/ChangePasswordPage'
import { BrowserRouter } from 'react-router-dom'
import { changePassword } from '../features/profile/services/client.service'

vi.mock('../features/profile/services/client.service')

const { mockNavigate, mockUseParams, mockUseAuth } = vi.hoisted(() => {
  return {
    mockNavigate: vi.fn(),
    mockUseParams: vi.fn().mockReturnValue({ id: '123' }),
    mockUseAuth: vi.fn(),
  }
})

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
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
    mockUseAuth.mockReturnValue({ user: { role: 'USER' } })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders form elements', () => {
    render(
      <BrowserRouter>
        <ChangePasswordPage />
      </BrowserRouter>
    )
    expect(screen.getByText('Cambiar Contraseña')).toBeInTheDocument()
    expect(screen.getByText('Contraseña Actual')).toBeInTheDocument()
    expect(screen.getByText('Nueva Contraseña')).toBeInTheDocument()
  })

  it('submits form successfully', async () => {
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
    vi.mocked(changePassword).mockResolvedValue()

    const { container } = render(
      <BrowserRouter>
        <ChangePasswordPage />
      </BrowserRouter>
    )

    fireEvent.change(
      container.querySelector('input[name="currentPassword"]')!,
      { target: { value: 'oldPass' } }
    )
    fireEvent.change(container.querySelector('input[name="newPassword"]')!, {
      target: { value: 'newPass' },
    })

    fireEvent.click(screen.getByText('Actualizar Contraseña'))

    await waitFor(() => {
      expect(changePassword).toHaveBeenCalledWith('123', {
        currentPassword: 'oldPass',
        newPassword: 'newPass',
      })
      expect(
        screen.getByText('Contraseña actualizada correctamente')
      ).toBeInTheDocument()
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })

    setTimeoutSpy.mockRestore()
  })

  it('displays error message on submission failure', async () => {
    vi.mocked(changePassword).mockRejectedValue(new Error('Update failed'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { container } = render(
      <BrowserRouter>
        <ChangePasswordPage />
      </BrowserRouter>
    )

    fireEvent.change(
      container.querySelector('input[name="currentPassword"]')!,
      { target: { value: 'old' } }
    )
    fireEvent.change(container.querySelector('input[name="newPassword"]')!, {
      target: { value: 'new' },
    })

    fireEvent.click(screen.getByText('Actualizar Contraseña'))

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument()
    })
    consoleSpy.mockRestore()
  })

  it('navigates back when back button is clicked', () => {
    render(
      <BrowserRouter>
        <ChangePasswordPage />
      </BrowserRouter>
    )

    const backButton = screen.getByText('Volver')
    fireEvent.click(backButton)
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('hides current password field for ADMIN', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'ADMIN' } })
    render(
      <BrowserRouter>
        <ChangePasswordPage />
      </BrowserRouter>
    )
    expect(screen.queryByText('Contraseña Actual')).not.toBeInTheDocument()
  })

  it('submits form successfully as ADMIN without current password', async () => {
    mockUseAuth.mockReturnValue({ user: { role: 'ADMIN' } })
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
    vi.mocked(changePassword).mockResolvedValue()

    const { container } = render(
      <BrowserRouter>
        <ChangePasswordPage />
      </BrowserRouter>
    )

    fireEvent.change(container.querySelector('input[name="newPassword"]')!, {
      target: { value: 'newPass' },
    })

    fireEvent.click(screen.getByText('Actualizar Contraseña'))

    await waitFor(() => {
      expect(changePassword).toHaveBeenCalledWith('123', {
        newPassword: 'newPass',
      })
      expect(
        screen.getByText('Contraseña actualizada correctamente')
      ).toBeInTheDocument()
    })

    setTimeoutSpy.mockRestore()
  })
})
