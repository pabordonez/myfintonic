import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MainLayout } from '../shared/components/MainLayout'
import { MemoryRouter } from 'react-router-dom'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('MainLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders navigation tabs correctly for USER role', () => {
    localStorage.setItem(
      'user',
      JSON.stringify({ role: 'USER', firstName: 'Test' })
    )

    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>
    )

    expect(screen.getByText('Mis Entidades')).toBeInTheDocument()
    expect(screen.getByText('Productos')).toBeInTheDocument()
    expect(screen.getByText('Entidades')).toBeInTheDocument()
    expect(screen.queryByText('Clientes')).not.toBeInTheDocument()
  })

  it('renders navigation tabs correctly for ADMIN role', () => {
    localStorage.setItem(
      'user',
      JSON.stringify({ role: 'ADMIN', firstName: 'Admin' })
    )

    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>
    )

    expect(screen.getByText('Clientes')).toBeInTheDocument()
    expect(screen.getByText('Productos')).toBeInTheDocument()
    expect(screen.getByText('Entidades')).toBeInTheDocument()
    expect(screen.queryByText('Mis Entidades')).not.toBeInTheDocument()
  })

  it('handles logout correctly', () => {
    localStorage.setItem(
      'user',
      JSON.stringify({ role: 'USER', firstName: 'Test' })
    )
    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>
    )

    const logoutButton = screen.getByTitle('Cerrar Sesión')
    fireEvent.click(logoutButton)

    expect(localStorage.length).toBe(0) // localStorage.clear() was called
    expect(mockNavigate).toHaveBeenCalledWith('/auth/login')
  })
})
