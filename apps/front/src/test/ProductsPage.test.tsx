import { render, screen, waitFor, fireEvent, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProductsPage } from '../features/products/pages/ProductsPage'
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

describe('ProductsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('redirects to login if no token', () => {
    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    )
    expect(mockNavigate).toHaveBeenCalledWith('/auth/login')
  })

  it('renders products list correctly', async () => {
    localStorage.setItem('token', 'test-token')

    const mockProducts = [
      {
        id: 'prod-1',
        name: 'Cuenta Nómina',
        type: 'CURRENT_ACCOUNT',
        financialEntityName: 'Banco Santander',
        status: 'ACTIVE',
        currentBalance: 2500.0,
      },
      {
        id: 'prod-2',
        name: 'Fondo Tecnológico',
        type: 'INVESTMENT_FUND',
        status: 'PAUSED',
        currentBalance: 10000.0,
      },
    ]

    vi.mocked(axios.get).mockResolvedValue({ data: mockProducts })

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Cuenta Nómina')).toBeInTheDocument()
      expect(screen.getAllByText('Banco Santander').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Cuenta Corriente').length).toBeGreaterThan(0)
      expect(screen.getByText('ACTIVE')).toBeInTheDocument()
      expect(screen.getByText(/2\.?500,00\s*€/)).toBeInTheDocument()

      expect(screen.getByText('Fondo Tecnológico')).toBeInTheDocument()
      expect(screen.getByText('PAUSED')).toBeInTheDocument()
    })
  })

  it('displays error message on fetch failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    localStorage.setItem('token', 'test-token')
    vi.mocked(axios.get).mockRejectedValue(new Error('Failed'))

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(
        screen.getByText('Error al cargar los productos.')
      ).toBeInTheDocument()
    })
    consoleSpy.mockRestore()
  })

  it('navigates to edit page when clicking on product name', async () => {
    localStorage.setItem('token', 'test-token')
    const mockProducts = [
      {
        id: 'prod-1',
        name: 'Cuenta Nómina',
        type: 'CURRENT_ACCOUNT',
        status: 'ACTIVE',
        currentBalance: 2500,
      },
    ]
    vi.mocked(axios.get).mockResolvedValue({ data: mockProducts })

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Cuenta Nómina')).toBeInTheDocument()
    })

    screen.getByText('Cuenta Nómina').click()
    expect(mockNavigate).toHaveBeenCalledWith('/products/prod-1')
  })

  it('deletes a product from the list after confirmation', async () => {
    localStorage.setItem('token', 'test-token')
    const mockProducts = [
      {
        id: 'prod-1',
        name: 'Cuenta Borrar',
        type: 'CURRENT_ACCOUNT',
        status: 'ACTIVE',
        currentBalance: 0,
      },
    ]
    vi.mocked(axios.get).mockResolvedValue({ data: mockProducts })
    vi.mocked(axios.delete).mockResolvedValue({})
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockImplementation(() => true)

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByText('Cuenta Borrar')).toBeInTheDocument()
    )

    const deleteBtn = screen.getByRole('button', { name: /eliminar/i })
    deleteBtn.click()

    expect(confirmSpy).toHaveBeenCalled()
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/products/prod-1'),
        expect.any(Object)
      )
      expect(axios.get).toHaveBeenCalledTimes(2) // Initial + Refresh
    })
    confirmSpy.mockRestore()
  })

  // --- Nuevos Tests de Filtrado y Ordenación ---

  it('filters products by name (case insensitive)', async () => {
    localStorage.setItem('token', 'test-token')
    const mockProducts = [
      { id: '1', name: 'Mi Cuenta Ahorro', type: 'SAVINGS_ACCOUNT', status: 'ACTIVE', currentBalance: 100 },
      { id: '2', name: 'Mi Fondo Inversión', type: 'INVESTMENT_FUND', status: 'ACTIVE', currentBalance: 200 },
    ]
    vi.mocked(axios.get).mockResolvedValue({ data: mockProducts })

    render(<MemoryRouter><ProductsPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Mi Cuenta Ahorro')).toBeInTheDocument())

    const searchInput = screen.getByPlaceholderText('Nombre...')
    fireEvent.change(searchInput, { target: { value: 'fondo' } })

    expect(screen.queryByText('Mi Cuenta Ahorro')).not.toBeInTheDocument()
    expect(screen.getByText('Mi Fondo Inversión')).toBeInTheDocument()
  })

  it('filters products by type', async () => {
    localStorage.setItem('token', 'test-token')
    const mockProducts = [
      { id: '1', name: 'P1', type: 'CURRENT_ACCOUNT', status: 'ACTIVE', currentBalance: 100 },
      { id: '2', name: 'P2', type: 'STOCKS', status: 'ACTIVE', currentBalance: 200 },
    ]
    vi.mocked(axios.get).mockResolvedValue({ data: mockProducts })

    render(<MemoryRouter><ProductsPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('P1')).toBeInTheDocument())

    const typeSelect = screen.getByLabelText(/Tipo/i)
    fireEvent.change(typeSelect, { target: { value: 'STOCKS' } })

    expect(screen.queryByText('P1')).not.toBeInTheDocument()
    expect(screen.getByText('P2')).toBeInTheDocument()
  })

  it('filters products by multiple entities', async () => {
    localStorage.setItem('token', 'test-token')
    const mockProducts = [
      { id: '1', name: 'P1', financialEntityName: 'Bank A', type: 'CURRENT_ACCOUNT', status: 'ACTIVE', currentBalance: 100 },
      { id: '2', name: 'P2', financialEntityName: 'Bank B', type: 'CURRENT_ACCOUNT', status: 'ACTIVE', currentBalance: 100 },
      { id: '3', name: 'P3', financialEntityName: 'Bank C', type: 'CURRENT_ACCOUNT', status: 'ACTIVE', currentBalance: 100 },
    ]
    vi.mocked(axios.get).mockResolvedValue({ data: mockProducts })

    render(<MemoryRouter><ProductsPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('P1')).toBeInTheDocument())

    const entitySelect = screen.getByLabelText(/Entidad/i) as HTMLSelectElement
    // Seleccionar Bank A y Bank C
    Array.from(entitySelect.options).forEach((option) => {
      option.selected = ['Bank A', 'Bank C'].includes(option.value)
    })
    fireEvent.change(entitySelect)

    expect(screen.getByText('P1')).toBeInTheDocument()
    expect(screen.queryByText('P2')).not.toBeInTheDocument()
    expect(screen.getByText('P3')).toBeInTheDocument()
  })

  it('sorts products by balance', async () => {
    localStorage.setItem('token', 'test-token')
    const mockProducts = [
      { id: '1', name: 'Low', type: 'CURRENT_ACCOUNT', status: 'ACTIVE', currentBalance: 100 },
      { id: '2', name: 'High', type: 'CURRENT_ACCOUNT', status: 'ACTIVE', currentBalance: 1000 },
    ]
    vi.mocked(axios.get).mockResolvedValue({ data: mockProducts })

    render(<MemoryRouter><ProductsPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Low')).toBeInTheDocument())

    const balanceHeader = screen.getByText(/Balance/i)

    // 1. Click -> Ascendente (Menor a Mayor)
    fireEvent.click(balanceHeader)
    let rows = screen.getAllByRole('row')
    // row[0] es header. row[1] debe ser Low (100)
    expect(within(rows[1]).getByText('Low')).toBeInTheDocument()

    // 2. Click -> Descendente (Mayor a Menor)
    fireEvent.click(balanceHeader)
    rows = screen.getAllByRole('row')
    // row[1] debe ser High (1000)
    expect(within(rows[1]).getByText('High')).toBeInTheDocument()

    // 3. Click -> Reset (Orden original o por defecto)
    fireEvent.click(balanceHeader)
    rows = screen.getAllByRole('row')
    expect(within(rows[1]).getByText('Low')).toBeInTheDocument()
  })
})
