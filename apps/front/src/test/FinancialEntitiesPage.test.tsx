import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FinancialEntitiesPage } from '../features/entities/pages/FinancialEntitiesPage'
import axios from 'axios'
import { MemoryRouter } from 'react-router-dom'

vi.mock('axios')
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('FinancialEntitiesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('redirects to login if no token', () => {
    render(
      <MemoryRouter>
        <FinancialEntitiesPage />
      </MemoryRouter>
    )
    expect(mockNavigate).toHaveBeenCalledWith('/auth/login')
  })

  it('renders entities list correctly', async () => {
    localStorage.setItem('token', 'test-token')

    const mockEntities = [
      { id: 'ent-1', name: 'BBVA' },
      { id: 'ent-2', name: 'CaixaBank' },
    ]

    vi.mocked(axios.get).mockResolvedValue({ data: mockEntities })

    render(
      <MemoryRouter>
        <FinancialEntitiesPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('BBVA')).toBeInTheDocument()
      expect(screen.getByText('CaixaBank')).toBeInTheDocument()
    })
  })

  it('displays empty state message', async () => {
    localStorage.setItem('token', 'test-token')
    vi.mocked(axios.get).mockResolvedValue({ data: [] })

    render(
      <MemoryRouter>
        <FinancialEntitiesPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(
        screen.getByText('No hay entidades disponibles.')
      ).toBeInTheDocument()
    })
  })

  it('navigates to edit entity when clicking name', async () => {
    localStorage.setItem('token', 'test-token')
    const mockEntities = [{ id: 'ent-1', name: 'BBVA' }]
    vi.mocked(axios.get).mockResolvedValue({ data: mockEntities })

    render(
      <MemoryRouter>
        <FinancialEntitiesPage />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('BBVA')).toBeInTheDocument())

    screen.getByText('BBVA').click()
    expect(mockNavigate).toHaveBeenCalledWith('/financial-entities/ent-1')
  })

  it('shows create button for ADMIN', async () => {
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('role', 'ADMIN')
    vi.mocked(axios.get).mockResolvedValue({ data: [] })

    render(
      <MemoryRouter>
        <FinancialEntitiesPage />
      </MemoryRouter>
    )
    await waitFor(() =>
      expect(screen.getByText('Nueva Entidad')).toBeInTheDocument()
    )
  })

  it('hides create button for USER', async () => {
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('role', 'USER')
    vi.mocked(axios.get).mockResolvedValue({ data: [] })

    render(
      <MemoryRouter>
        <FinancialEntitiesPage />
      </MemoryRouter>
    )
    await waitFor(() =>
      expect(screen.queryByText('Nueva Entidad')).not.toBeInTheDocument()
    )
  })
})
