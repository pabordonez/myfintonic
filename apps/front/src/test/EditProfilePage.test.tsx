import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { EditProfilePage } from '@/features/profile/pages/EditProfilePage'
import { useAuth } from '@/hooks/useAuth'
import { updateClientProfile } from '@/features/profile/services/client.service'
import { BrowserRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mocks
vi.mock('@/hooks/useAuth')
vi.mock('@/features/profile/services/client.service')

// Mock de navegación
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('EditProfilePage', () => {
  const mockRefreshUser = vi.fn()
  const user = {
    id: '123',
    firstName: 'Juan',
    lastName: 'Perez',
    nickname: 'Juancito',
    role: 'USER',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useAuth as any).mockReturnValue({
      user,
      token: 'fake-token',
      refreshUser: mockRefreshUser,
    })
  })

  it('should load initial user data into the form', () => {
    render(
      <BrowserRouter>
        <EditProfilePage />
      </BrowserRouter>
    )

    expect(screen.getByDisplayValue('Juan')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Perez')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Juancito')).toBeInTheDocument()
  })

  it('should call update service and refresh user context on successful submit', async () => {
    const updatedUser = { ...user, firstName: 'Juan Updated' }
    ;(updateClientProfile as any).mockResolvedValue(updatedUser)

    render(
      <BrowserRouter>
        <EditProfilePage />
      </BrowserRouter>
    )

    // Simular cambio en el input
    const nameInput = screen.getByDisplayValue('Juan')
    fireEvent.change(nameInput, { target: { value: 'Juan Updated' } })

    // Enviar formulario
    const submitBtn = screen.getByText(/Guardar Cambios/i)
    fireEvent.click(submitBtn)

    // Verificar llamada al servicio
    await waitFor(() => {
      expect(updateClientProfile).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({ firstName: 'Juan Updated' }),
        'fake-token'
      )
    })

    // Verificar actualización de contexto y localStorage
    expect(mockRefreshUser).toHaveBeenCalled()
    expect(localStorage.getItem('user')).toContain('Juan Updated')

    // Verificar mensaje de éxito
    expect(
      screen.getByText('Perfil actualizado correctamente')
    ).toBeInTheDocument()
  })

  it('should redirect to /dashboard after successful update', async () => {
    const updatedUser = { ...user, firstName: 'Juan Updated' }
    ;(updateClientProfile as any).mockResolvedValue(updatedUser)

    render(
      <BrowserRouter>
        <EditProfilePage />
      </BrowserRouter>
    )

    const submitBtn = screen.getByText(/Guardar Cambios/i)
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(
        screen.getByText('Perfil actualizado correctamente')
      ).toBeInTheDocument()
    })

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
      },
      { timeout: 3000 }
    )
  })

  it('should display error message if update fails', async () => {
    ;(updateClientProfile as any).mockRejectedValue(new Error('Network Error'))

    render(
      <BrowserRouter>
        <EditProfilePage />
      </BrowserRouter>
    )

    const submitBtn = screen.getByText(/Guardar Cambios/i)
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(
        screen.getByText('No se pudo actualizar el perfil. Inténtalo de nuevo.')
      ).toBeInTheDocument()
    })
    expect(mockRefreshUser).not.toHaveBeenCalled()
  })
})
