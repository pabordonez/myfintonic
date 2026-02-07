import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Navbar } from '../shared/components/Navbar'
import { useAuth } from '../hooks/useAuth'
import { BrowserRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock de useAuth
vi.mock('../hooks/useAuth')

// Mock de iconos para simplificar el DOM
vi.mock('lucide-react', () => ({
  LogOut: () => <span data-testid="logout-icon" />,
  Settings: () => <span data-testid="settings-icon" />,
}))

describe('Navbar Component', () => {
  const mockLogout = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render nickname if user has one', () => {
    ;(useAuth as any).mockReturnValue({
      user: { firstName: 'Juan', nickname: 'Juancito', role: 'USER' },
      logout: mockLogout,
    })

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )

    // Debe mostrar el nickname
    expect(screen.getByText('Juancito')).toBeInTheDocument()
    // No debe mostrar el nombre real como texto principal
    expect(screen.queryByText(/^Juan$/)).not.toBeInTheDocument()
  })

  it('should render firstName if nickname is missing', () => {
    ;(useAuth as any).mockReturnValue({
      user: { firstName: 'Juan', nickname: null, role: 'USER' },
      logout: mockLogout,
    })

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )

    expect(screen.getByText('Juan')).toBeInTheDocument()
  })

  it('should have a link to edit profile', () => {
    ;(useAuth as any).mockReturnValue({
      user: { firstName: 'Juan', role: 'USER' },
      logout: mockLogout,
    })

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )

    const editLink = screen.getByTitle('Editar Perfil')
    expect(editLink).toBeInTheDocument()
    expect(editLink.closest('a')).toHaveAttribute('href', '/profile/edit')
  })

  it('should not render anything if no user is logged in', () => {
    ;(useAuth as any).mockReturnValue({ user: null })
    const { container } = render(<Navbar />)
    expect(container).toBeEmptyDOMElement()
  })

  it('should render navigation links for USER role', () => {
    ;(useAuth as any).mockReturnValue({
      user: { firstName: 'Juan', role: 'USER' },
      logout: mockLogout,
    })

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )

    expect(screen.getByText('Mis Entidades')).toBeInTheDocument()
    expect(screen.getByText('Productos')).toBeInTheDocument()
    expect(screen.getByText('Entidades')).toBeInTheDocument()
    expect(screen.queryByText('Clientes')).not.toBeInTheDocument()
  })

  it('should render navigation links for ADMIN role', () => {
    ;(useAuth as any).mockReturnValue({
      user: { firstName: 'Admin', role: 'ADMIN' },
      logout: mockLogout,
    })

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )

    expect(screen.getByText('Clientes')).toBeInTheDocument()
    expect(screen.getByText('Productos')).toBeInTheDocument()
    expect(screen.getByText('Entidades')).toBeInTheDocument()
    expect(screen.queryByText('Mis Entidades')).not.toBeInTheDocument()
  })
})
