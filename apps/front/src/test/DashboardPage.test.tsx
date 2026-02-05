import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DashboardPage } from '../features/dashboard/pages/DashboardPage'
import axios from 'axios'
import { MemoryRouter } from 'react-router-dom'
import { API_URL } from '../config/api'

// Mock dependencies
vi.mock('axios')
const mockUseAuth = vi.fn()
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing if user is null', () => {
    mockUseAuth.mockReturnValue({ user: null, token: null })
    const { container } = render(<DashboardPage />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders loading state initially', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'USER', id: '1' }, token: 'token' })
    vi.mocked(axios.get).mockImplementation(() => new Promise(() => {})) // Never resolves
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('renders error state', async () => {
    mockUseAuth.mockReturnValue({ user: { role: 'USER', id: '1' }, token: 'token' })
    vi.mocked(axios.get).mockRejectedValue(new Error('Network error'))
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )
    await waitFor(() => expect(screen.getByText('Error al cargar los datos')).toBeInTheDocument())
  })

  describe('USER Role', () => {
    const mockItems = [
      {
        id: '1',
        balance: 1000,
        initialBalance: 800,
        financialEntity: { name: 'Bank A' },
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        balance: 500,
        initialBalance: 600,
        financialEntity: { name: 'Bank B' },
        updatedAt: new Date().toISOString(),
      },
    ]

    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: { role: 'USER', id: 'u1' }, token: 'token' })
      vi.mocked(axios.get).mockResolvedValue({ data: mockItems })
    })

    it('fetches and renders user financial entities', async () => {
      render(
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      )

      await waitFor(() => expect(axios.get).toHaveBeenCalledWith(`${API_URL}/clients/u1/financial-entities`, expect.any(Object)))
      expect(screen.getByText('Mis Entidades Financieras')).toBeInTheDocument()
      expect(screen.getByText('Bank A')).toBeInTheDocument()
      expect(screen.getByText('Bank B')).toBeInTheDocument()
    })

    it('calculates and displays total balance', async () => {
      render(
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      )
      await waitFor(() => expect(screen.getByText('Balance Total')).toBeInTheDocument())
      // 1000 + 500 = 1500. Buscamos formato parcial
      expect(screen.getByText(/1.?500,00/)).toBeInTheDocument() 
    })

    it('sorts items by name', async () => {
      render(
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      )
      await waitFor(() => expect(screen.getByText('Bank A')).toBeInTheDocument())

      const nameHeader = screen.getByText('Nombre')
      
      // Click to sort ASC
      fireEvent.click(nameHeader)
      const rowsAsc = screen.getAllByRole('row')
      // Row 0 is header. Row 1 should be Bank A, Row 2 Bank B
      expect(rowsAsc[1]).toHaveTextContent('Bank A')
      expect(rowsAsc[2]).toHaveTextContent('Bank B')

      // Click to sort DESC
      fireEvent.click(nameHeader)
      const rowsDesc = screen.getAllByRole('row')
      expect(rowsDesc[1]).toHaveTextContent('Bank B')
      expect(rowsDesc[2]).toHaveTextContent('Bank A')
    })

    it('sorts items by balance', async () => {
      render(
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      )
      await waitFor(() => expect(screen.getByText('Bank A')).toBeInTheDocument())

      const balanceHeader = screen.getByText('Balance Actual')
      
      // Click to sort ASC (500 then 1000)
      fireEvent.click(balanceHeader)
      const rowsAsc = screen.getAllByRole('row')
      expect(rowsAsc[1]).toHaveTextContent(/500,00/) // Bank B
      expect(rowsAsc[2]).toHaveTextContent(/1.?000,00/) // Bank A

      // Click to sort DESC (1000 then 500)
      fireEvent.click(balanceHeader)
      const rowsDesc = screen.getAllByRole('row')
      expect(rowsDesc[1]).toHaveTextContent(/1.?000,00/)
      expect(rowsDesc[2]).toHaveTextContent(/500,00/)
    })

    it('sorts items by differential', async () => {
      const items = [
        { id: '1', balance: 1000, initialBalance: 800, financialEntity: { name: 'A' } }, // Diff 200
        { id: '2', balance: 500, initialBalance: 600, financialEntity: { name: 'B' } },  // Diff -100
        { id: '3', balance: 1000, initialBalance: 1000, financialEntity: { name: 'C' } }, // Diff 0
      ]
      vi.mocked(axios.get).mockResolvedValue({ data: items })

      render(
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      )
      await waitFor(() => expect(screen.getByText('A')).toBeInTheDocument())

      const diffHeader = screen.getByText('Diferencial')

      // Sort ASC: -100 (B), 0 (C), 200 (A)
      fireEvent.click(diffHeader)
      const rows = screen.getAllByRole('row')
      // row[0] is header
      expect(rows[1]).toHaveTextContent('B')
      expect(rows[2]).toHaveTextContent('C')
      expect(rows[3]).toHaveTextContent('A')
    })

    it('sorts items with equal values', async () => {
      const items = [
        { id: '1', balance: 1000, initialBalance: 0, financialEntity: { name: 'A' } },
        { id: '2', balance: 1000, initialBalance: 0, financialEntity: { name: 'B' } },
      ]
      vi.mocked(axios.get).mockResolvedValue({ data: items })

      render(
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      )
      await waitFor(() => expect(screen.getByText('A')).toBeInTheDocument())

      const balanceHeader = screen.getByText('Balance Actual')
      fireEvent.click(balanceHeader)
      
      expect(screen.getByText('A')).toBeInTheDocument()
      expect(screen.getByText('B')).toBeInTheDocument()
    })

    it('filters items by search term', async () => {
      render(
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      )
      await waitFor(() => expect(screen.getByText('Bank A')).toBeInTheDocument())

      const searchInput = screen.getByPlaceholderText('Buscar entidad...')
      fireEvent.change(searchInput, { target: { value: 'Bank B' } })

      expect(screen.queryByText('Bank A')).not.toBeInTheDocument()
      expect(screen.getByText('Bank B')).toBeInTheDocument()
    })

    it('deletes an item', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      vi.mocked(axios.delete).mockResolvedValue({})

      render(
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      )
      await waitFor(() => expect(screen.getByText('Bank A')).toBeInTheDocument())

      const deleteButtons = screen.getAllByTitle('Eliminar entidad')
      fireEvent.click(deleteButtons[0]) // Delete Bank A

      await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledWith(`${API_URL}/clients/u1/financial-entities/1`, expect.any(Object))
        expect(screen.queryByText('Bank A')).not.toBeInTheDocument()
      })
    })

    it('handles delete error', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      vi.mocked(axios.delete).mockRejectedValue(new Error('Delete failed'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      )
      await waitFor(() => expect(screen.getByText('Bank A')).toBeInTheDocument())

      const deleteButtons = screen.getAllByTitle('Eliminar entidad')
      fireEvent.click(deleteButtons[0])

      await waitFor(() => expect(screen.getByText('Error al eliminar la entidad')).toBeInTheDocument())
      consoleSpy.mockRestore()
    })

    it('handles missing user ID gracefully', async () => {
      mockUseAuth.mockReturnValue({ user: { role: 'USER' }, token: 'token' }) // No ID
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      )
      await waitFor(() => expect(screen.getByText('Error al cargar los datos')).toBeInTheDocument())
      consoleSpy.mockRestore()
    })
  })

  describe('ADMIN Role', () => {
    it('fetches and renders clients list by default', async () => {
      mockUseAuth.mockReturnValue({ user: { role: 'ADMIN', id: 'admin' }, token: 'token' })
      const mockClients = [
        { id: 'c1', firstName: 'John', lastName: 'Doe', email: 'john@test.com', role: 'USER' }
      ]
      vi.mocked(axios.get).mockResolvedValue({ data: mockClients })

      render(
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      )

      await waitFor(() => expect(axios.get).toHaveBeenCalledWith(`${API_URL}/clients`, expect.any(Object)))
      expect(screen.getByText('Clientes')).toBeInTheDocument()
      expect(screen.getByText(/John Doe/)).toBeInTheDocument()
    })

    describe('Global Entities View', () => {
      const mockGlobalEntities = [
        {
          id: '1',
          balance: 1000,
          initialBalance: 800,
          financialEntity: { name: 'Bank A' },
          client: { firstName: 'John', lastName: 'Doe', email: 'john@test.com' },
          updatedAt: new Date().toISOString(),
        }
      ]

      beforeEach(() => {
        mockUseAuth.mockReturnValue({ user: { role: 'ADMIN', id: 'admin' }, token: 'token' })
      })

      it('renders tabs to switch views', async () => {
        vi.mocked(axios.get).mockResolvedValue({ data: [] })
        render(
          <MemoryRouter>
            <DashboardPage />
          </MemoryRouter>
        )
        await waitFor(() => expect(screen.getByText('Clientes')).toBeInTheDocument())
        
        expect(screen.getByText('Clientes')).toBeInTheDocument()
        expect(screen.getByText('Clientes-Entidades')).toBeInTheDocument()
      })

      it('switches to entities view and back to clients', async () => {
        vi.mocked(axios.get)
          .mockResolvedValueOnce({ data: [] }) // Initial load (Clients)
          .mockResolvedValueOnce({ data: mockGlobalEntities }) // Switch to Entities
          .mockResolvedValueOnce({ data: [] }) // Switch back to Clients

        render(
          <MemoryRouter>
            <DashboardPage />
          </MemoryRouter>
        )
        
        await waitFor(() => expect(screen.getByText('Clientes')).toBeInTheDocument())

        const entitiesTab = screen.getByText('Clientes-Entidades')
        fireEvent.click(entitiesTab)

        await waitFor(() => {
          expect(axios.get).toHaveBeenCalledWith(`${API_URL}/clients-financial-entities`, expect.any(Object))
          expect(screen.getByText('Bank A')).toBeInTheDocument()
        })

        // Verify Admin specific columns/restrictions
        expect(screen.getByText('Cliente')).toBeInTheDocument()
        expect(screen.getByText(/John Doe/)).toBeInTheDocument()
        expect(screen.queryByText('Nueva Entidad')).not.toBeInTheDocument()
        expect(screen.queryByText('Acciones')).not.toBeInTheDocument()

        // Switch back to Clients to cover the onClick handler
        const clientsTab = screen.getByText('Clientes')
        fireEvent.click(clientsTab)

        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(3))
      })
    })
  })
})