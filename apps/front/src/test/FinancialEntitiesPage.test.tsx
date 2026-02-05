import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FinancialEntitiesPage } from '../features/financial-entities/pages/FinancialEntitiesPage'
import axios from 'axios'
import { MemoryRouter } from 'react-router-dom'

vi.mock('axios')
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock dinámico para useAuth
const mockUseAuth = vi.fn()
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('FinancialEntitiesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Valor por defecto para la mayoría de tests
    mockUseAuth.mockReturnValue({ token: 'test-token', user: { role: 'USER' } })
  })

  it('shows the search input box', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: [] })
    render(
      <MemoryRouter>
        <FinancialEntitiesPage />
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar entidad...')).toBeInTheDocument()
    })
  })

  it('renders entities list correctly', async () => {
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
    vi.mocked(axios.get).mockResolvedValue({ data: [] })

    render(
      <MemoryRouter>
        <FinancialEntitiesPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(
        screen.getByText('No hay entidades disponibles.'),
      ).toBeInTheDocument()
    })
  })

  it('sorts entities by name', async () => {
    const mockEntities = [
      { id: '1', name: 'Z Bank' },
      { id: '2', name: 'A Bank' },
    ]
    vi.mocked(axios.get).mockResolvedValue({ data: mockEntities })

    render(
      <MemoryRouter>
        <FinancialEntitiesPage />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Z Bank')).toBeInTheDocument())

    const nameHeader = screen.getByText('Nombre')
    
    // Sort ASC
    fireEvent.click(nameHeader)
    const rowsAsc = screen.getAllByRole('row')
    // Row 0 header, Row 1 A Bank, Row 2 Z Bank
    expect(rowsAsc[1]).toHaveTextContent('A Bank')
    expect(rowsAsc[2]).toHaveTextContent('Z Bank')

    // Sort DESC
    fireEvent.click(nameHeader)
    const rowsDesc = screen.getAllByRole('row')
    expect(rowsDesc[1]).toHaveTextContent('Z Bank')
    expect(rowsDesc[2]).toHaveTextContent('A Bank')
  })

  it('handles fetch error', async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error('API Error'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <FinancialEntitiesPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Error al cargar el catálogo de entidades')).toBeInTheDocument()
    })
    consoleSpy.mockRestore()
  })

  it('toggles sort direction correctly', async () => {
    const mockEntities = [
      { id: '1', name: 'A Bank' },
      { id: '2', name: 'B Bank' },
    ]
    vi.mocked(axios.get).mockResolvedValue({ data: mockEntities })

    render(
      <MemoryRouter>
        <FinancialEntitiesPage />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('A Bank')).toBeInTheDocument())

    const nameHeader = screen.getByText('Nombre')
    
    // First click: ASC (A -> B)
    fireEvent.click(nameHeader)
    let rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('A Bank')
    expect(rows[2]).toHaveTextContent('B Bank')

    // Second click: DESC (B -> A)
    fireEvent.click(nameHeader)
    rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('B Bank')
    expect(rows[2]).toHaveTextContent('A Bank')
  })

  it('navigates to entity details on row click', async () => {
    const mockEntities = [{ id: 'ent-1', name: 'Bank A' }]
    vi.mocked(axios.get).mockResolvedValue({ data: mockEntities })

    render(
      <MemoryRouter>
        <FinancialEntitiesPage />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Bank A')).toBeInTheDocument())

    fireEvent.click(screen.getByText('Bank A').closest('tr')!)
    expect(mockNavigate).toHaveBeenCalledWith('/financial-entities/ent-1')
  })

  it('filters entities by search term', async () => {
    const mockEntities = [
      { id: '1', name: 'Banco Santander' },
      { id: '2', name: 'BBVA' },
    ]
    vi.mocked(axios.get).mockResolvedValue({ data: mockEntities })

    render(
      <MemoryRouter>
        <FinancialEntitiesPage />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Banco Santander')).toBeInTheDocument())

    const searchInput = screen.getByPlaceholderText('Buscar entidad...')
    fireEvent.change(searchInput, { target: { value: 'Santander' } })

    expect(screen.getByText('Banco Santander')).toBeInTheDocument()
    expect(screen.queryByText('BBVA')).not.toBeInTheDocument()
  })

  it('renders "Nueva Entidad" button for ADMIN role', async () => {
    mockUseAuth.mockReturnValue({ token: 'test-token', user: { role: 'ADMIN' } })
    vi.mocked(axios.get).mockResolvedValue({ data: [] })

    render(
      <MemoryRouter>
        <FinancialEntitiesPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Nueva Entidad')).toBeInTheDocument()
    })
  })

  it('does not fetch entities if token is missing', async () => {
    mockUseAuth.mockReturnValue({ token: null, user: { role: 'USER' } })
    render(
      <MemoryRouter>
        <FinancialEntitiesPage />
      </MemoryRouter>
    )
    expect(axios.get).not.toHaveBeenCalled()
  })

  it('renders entity date if present', async () => {
    const mockEntities = [{ id: 'ent-1', name: 'Bank With Date', updatedAt: '2023-10-10T10:00:00Z' }]
    vi.mocked(axios.get).mockResolvedValue({ data: mockEntities })

    render(
      <MemoryRouter>
        <FinancialEntitiesPage />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText(/2023/)).toBeInTheDocument())
  })
})
