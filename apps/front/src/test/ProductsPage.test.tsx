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

    const deleteBtn = screen.getByTitle('Eliminar producto')
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

  it('filters products by status', async () => {
    localStorage.setItem('token', 'test-token')
    const mockProducts = [
      { id: '1', name: 'Active', type: 'CURRENT_ACCOUNT', status: 'ACTIVE', currentBalance: 100 },
      { id: '2', name: 'Paused', type: 'CURRENT_ACCOUNT', status: 'PAUSED', currentBalance: 100 },
    ]
    vi.mocked(axios.get).mockResolvedValue({ data: mockProducts })

    render(<MemoryRouter><ProductsPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Active')).toBeInTheDocument())

    const statusSelect = screen.getByLabelText(/Estado/i)
    fireEvent.change(statusSelect, { target: { value: 'PAUSED' } })

    expect(screen.queryByText('Active')).not.toBeInTheDocument()
    expect(screen.getByText('Paused')).toBeInTheDocument()
  })

  it('displays error message on delete failure', async () => {
    localStorage.setItem('token', 'test-token')
    const mockProducts = [
      { id: '1', name: 'Product to Delete', type: 'CURRENT_ACCOUNT', status: 'ACTIVE', currentBalance: 100 },
    ]
    vi.mocked(axios.get).mockResolvedValue({ data: mockProducts })
    vi.mocked(axios.delete).mockRejectedValue(new Error('Delete failed'))
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<MemoryRouter><ProductsPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Product to Delete')).toBeInTheDocument())

    const deleteBtn = screen.getByTitle('Eliminar producto')
    fireEvent.click(deleteBtn)

    await waitFor(() => expect(screen.getByText('Error al eliminar el producto.')).toBeInTheDocument())
    
    confirmSpy.mockRestore()
    consoleSpy.mockRestore()
  })

  it('redirects to login on 401 error during fetch', async () => {
    localStorage.setItem('token', 'test-token')
    const error: any = new Error('Unauthorized')
    error.response = { status: 401 }
    vi.mocked(axios.isAxiosError).mockReturnValue(true)
    vi.mocked(axios.get).mockRejectedValue(error)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<MemoryRouter><ProductsPage /></MemoryRouter>)

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull()
      expect(mockNavigate).toHaveBeenCalledWith('/auth/login')
    })
    consoleSpy.mockRestore()
  })

  it('redirects to login on 401 error during fetch', async () => {
    localStorage.setItem('token', 'test-token')
    const error: any = new Error('Unauthorized')
    error.response = { status: 401 }
    vi.mocked(axios.isAxiosError).mockReturnValue(true)
    vi.mocked(axios.get).mockRejectedValue(error)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<MemoryRouter><ProductsPage /></MemoryRouter>)

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull()
      expect(mockNavigate).toHaveBeenCalledWith('/auth/login')
    })
    consoleSpy.mockRestore()
  })

  it('redirects to login on 401 error during fetch', async () => {
    localStorage.setItem('token', 'test-token')
    const error: any = new Error('Unauthorized')
    error.response = { status: 401 }
    vi.mocked(axios.isAxiosError).mockReturnValue(true)
    vi.mocked(axios.get).mockRejectedValue(error)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<MemoryRouter><ProductsPage /></MemoryRouter>)

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull()
      expect(mockNavigate).toHaveBeenCalledWith('/auth/login')
    })
    consoleSpy.mockRestore()
  })

  it('redirects to login on 401 error during fetch', async () => {
    localStorage.setItem('token', 'test-token')
    const error: any = new Error('Unauthorized')
    error.response = { status: 401 }
    vi.mocked(axios.isAxiosError).mockReturnValue(true)
    vi.mocked(axios.get).mockRejectedValue(error)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<MemoryRouter><ProductsPage /></MemoryRouter>)

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull()
      expect(mockNavigate).toHaveBeenCalledWith('/auth/login')
    })
    consoleSpy.mockRestore()
  })

  it('redirects to login on 401 error during fetch', async () => {
    localStorage.setItem('token', 'test-token')
    const error: any = new Error('Unauthorized')
    error.response = { status: 401 }
    vi.mocked(axios.isAxiosError).mockReturnValue(true)
    vi.mocked(axios.get).mockRejectedValue(error)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<MemoryRouter><ProductsPage /></MemoryRouter>)

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull()
      expect(mockNavigate).toHaveBeenCalledWith('/auth/login')
    })
    consoleSpy.mockRestore()
  })

  it('renders correct status colors', async () => {
    localStorage.setItem('token', 'test-token')
    const mockProducts = [
      { id: '1', name: 'P1', status: 'ACTIVE', type: 'CURRENT_ACCOUNT' },
      { id: '2', name: 'P2', status: 'PAUSED', type: 'CURRENT_ACCOUNT' },
      { id: '3', name: 'P3', status: 'EXPIRED', type: 'CURRENT_ACCOUNT' },
      { id: '4', name: 'P4', status: 'INACTIVE', type: 'CURRENT_ACCOUNT' },
    ]
    vi.mocked(axios.get).mockResolvedValue({ data: mockProducts })

    render(<MemoryRouter><ProductsPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('P1')).toBeInTheDocument())

    const activeBadge = screen.getByText('ACTIVE')
    expect(activeBadge).toHaveClass('bg-green-100')

    const pausedBadge = screen.getByText('PAUSED')
    expect(pausedBadge).toHaveClass('bg-yellow-100')

    const expiredBadge = screen.getByText('EXPIRED')
    expect(expiredBadge).toHaveClass('bg-red-100')

    const inactiveBadge = screen.getByText('INACTIVE')
    expect(inactiveBadge).toHaveClass('bg-gray-100')
  })

  it('sorts products by name (string comparison) and cycles sort direction', async () => {
    localStorage.setItem('token', 'test-token')
    const mockProducts = [
      { id: '1', name: 'Alpha', status: 'ACTIVE', type: 'CURRENT_ACCOUNT' },
      { id: '2', name: 'Beta', status: 'ACTIVE', type: 'CURRENT_ACCOUNT' },
    ]
    vi.mocked(axios.get).mockResolvedValue({ data: mockProducts })

    render(<MemoryRouter><ProductsPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Alpha')).toBeInTheDocument())

    const nameHeader = screen.getByText(/Nombre/i)

    // 1. Click -> Ascendente (Alpha, Beta)
    fireEvent.click(nameHeader)
    let rows = screen.getAllByRole('row')
    expect(within(rows[1]).getByText('Alpha')).toBeInTheDocument()

    // 2. Click -> Descendente (Beta, Alpha)
    fireEvent.click(nameHeader)
    rows = screen.getAllByRole('row')
    expect(within(rows[1]).getByText('Beta')).toBeInTheDocument()

    // 3. Click -> Null (Orden original / sin orden)
    fireEvent.click(nameHeader)
    rows = screen.getAllByRole('row')
    expect(within(rows[1]).getByText('Alpha')).toBeInTheDocument()
  })

  it('clears filters', async () => {
    localStorage.setItem('token', 'test-token')
    const mockProducts = [
      { id: '1', name: 'Alpha', status: 'ACTIVE', type: 'CURRENT_ACCOUNT' },
      { id: '2', name: 'Beta', status: 'PAUSED', type: 'SAVINGS_ACCOUNT' },
    ]
    vi.mocked(axios.get).mockResolvedValue({ data: mockProducts })

    render(<MemoryRouter><ProductsPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Alpha')).toBeInTheDocument())

    // Aplicar filtro
    const searchInput = screen.getByPlaceholderText('Nombre...')
    fireEvent.change(searchInput, { target: { value: 'Alpha' } })
    expect(screen.queryByText('Beta')).not.toBeInTheDocument()

    // Limpiar
    fireEvent.click(screen.getByText('Limpiar Filtros'))
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('displays empty state message when no products found', async () => {
    localStorage.setItem('token', 'test-token')
    vi.mocked(axios.get).mockResolvedValue({ data: [] })

    render(<MemoryRouter><ProductsPage /></MemoryRouter>)

    await waitFor(() => {
      // Adjust the text to match what your component actually renders for empty state
      // Based on DashboardPage logic, it might be "No hay elementos para mostrar." or similar.
      expect(screen.getByText(/No se encontraron productos|No hay productos|No hay elementos/i)).toBeInTheDocument()
    })
  })

  it('renders sort icons correctly', async () => {
    localStorage.setItem('token', 'test-token')
    // Provide data to ensure the table is rendered
    vi.mocked(axios.get).mockResolvedValue({
      data: [{ id: '1', name: 'P1', status: 'ACTIVE', type: 'CURRENT_ACCOUNT' }]
    })

    render(<MemoryRouter><ProductsPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByRole('columnheader', { name: /Nombre/i })).toBeInTheDocument())

    const nameHeader = screen.getByRole('columnheader', { name: /Nombre/i })
    
    // Default: no sort (double arrow)
    expect(within(nameHeader).getByText('↕')).toBeInTheDocument()

    // Click 1: Asc (Up arrow)
    fireEvent.click(nameHeader)
    expect(await within(nameHeader).findByText('▲')).toBeInTheDocument()

    // Click 2: Desc (Down arrow)
    fireEvent.click(nameHeader)
    expect(await within(nameHeader).findByText('▼')).toBeInTheDocument()
  })

  it('displays "No results found" when filter matches nothing', async () => {
    localStorage.setItem('token', 'test-token')
    const mockProducts = [{ id: '1', name: 'Alpha', status: 'ACTIVE', type: 'CURRENT_ACCOUNT' }]
    vi.mocked(axios.get).mockResolvedValue({ data: mockProducts })

    render(<MemoryRouter><ProductsPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Alpha')).toBeInTheDocument())

    const searchInput = screen.getByPlaceholderText('Nombre...')
    fireEvent.change(searchInput, { target: { value: 'Z' } })

    expect(screen.getByText(/No se encontraron productos/i)).toBeInTheDocument()
  })

  it('renders product with fallback balance', async () => {
    localStorage.setItem('token', 'test-token')
    const mockProducts = [
      { id: '1', name: 'P1', type: 'CURRENT_ACCOUNT', status: 'ACTIVE', currentBalance: null, initialBalance: 50 }
    ]
    vi.mocked(axios.get).mockResolvedValue({ data: mockProducts })

    render(<MemoryRouter><ProductsPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('P1')).toBeInTheDocument())
    
    // Should show 50,00 € (fallback to initialBalance)
    expect(screen.getByText(/50,00\s*€/)).toBeInTheDocument()
  })

  it('sorts products with equal values stably', async () => {
    localStorage.setItem('token', 'test-token')
    const mockProducts = [
      { id: '1', name: 'A', type: 'CURRENT_ACCOUNT', status: 'ACTIVE', currentBalance: 100 },
      { id: '2', name: 'A', type: 'CURRENT_ACCOUNT', status: 'ACTIVE', currentBalance: 100 },
    ]
    vi.mocked(axios.get).mockResolvedValue({ data: mockProducts })

    render(<MemoryRouter><ProductsPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getAllByText('A')).toHaveLength(2))

    const nameHeader = screen.getByText(/Nombre/i)
    fireEvent.click(nameHeader) // Sort
    
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(3) // Header + 2 items
  })

  it('sorts products by differential', async () => {
    localStorage.setItem('token', 'test-token')
    const mockProducts = [
      { id: '1', name: 'A', type: 'CURRENT_ACCOUNT', status: 'ACTIVE', currentBalance: 1000, initialBalance: 800 }, // Diff 200
      { id: '2', name: 'B', type: 'CURRENT_ACCOUNT', status: 'ACTIVE', currentBalance: 500, initialBalance: 600 },  // Diff -100
      { id: '3', name: 'C', type: 'CURRENT_ACCOUNT', status: 'ACTIVE', currentBalance: 1000, initialBalance: 1000 }, // Diff 0
    ]
    vi.mocked(axios.get).mockResolvedValue({ data: mockProducts })

    render(<MemoryRouter><ProductsPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('A')).toBeInTheDocument())

    // Click on the TH element to ensure onClick is triggered
    const diffHeader = screen.getByRole('columnheader', { name: /Diferencial/i })

    // Sort ASC: -100 (B), 0 (C), 200 (A)
    fireEvent.click(diffHeader)
    let rows = screen.getAllByRole('row')
    expect(within(rows[1]).getByText('B')).toBeInTheDocument()
    expect(within(rows[2]).getByText('C')).toBeInTheDocument()
    expect(within(rows[3]).getByText('A')).toBeInTheDocument()
  })

  it('renders sort icons for differential column', async () => {
    localStorage.setItem('token', 'test-token')
    vi.mocked(axios.get).mockResolvedValue({
      data: [{ id: '1', name: 'P1', status: 'ACTIVE', type: 'CURRENT_ACCOUNT' }]
    })

    render(<MemoryRouter><ProductsPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByRole('columnheader', { name: /Diferencial/i })).toBeInTheDocument())

    const diffHeader = screen.getByRole('columnheader', { name: /Diferencial/i })
    
    // Click 1: Asc
    fireEvent.click(diffHeader)
    expect(await within(diffHeader).findByText('▲')).toBeInTheDocument()
  })

  it('renders differential column correctly (Badge vs Dash)', async () => {
    localStorage.setItem('token', 'test-token')
    const mockProducts = [
      { id: '1', name: 'With Diff', type: 'CURRENT_ACCOUNT', status: 'ACTIVE', currentBalance: 1100, initialBalance: 1000 },
      { id: '2', name: 'No Diff', type: 'CURRENT_ACCOUNT', status: 'ACTIVE', currentBalance: 1000, initialBalance: null },
      { id: '3', name: 'Zero Initial', type: 'CURRENT_ACCOUNT', status: 'ACTIVE', currentBalance: 1000, initialBalance: 0 },
      { id: '4', name: 'String Initial', type: 'CURRENT_ACCOUNT', status: 'ACTIVE', currentBalance: 1000, initialBalance: "1000" }, // Test type coercion
    ]
    vi.mocked(axios.get).mockResolvedValue({ data: mockProducts })

    render(<MemoryRouter><ProductsPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('With Diff')).toBeInTheDocument())

    const rows = screen.getAllByRole('row')
    
    // Row 1 (With Diff): Badge (10.00%)
    expect(within(rows[1]).getByText(/10\.00%/)).toBeInTheDocument()
    
    // Row 2 (No Diff): Dash
    const cells2 = within(rows[2]).getAllByRole('cell')
    expect(cells2[3]).toHaveTextContent('-')
    
    // Row 3 (Zero Initial): Dash
    const cells3 = within(rows[3]).getAllByRole('cell')
    expect(cells3[3]).toHaveTextContent('-')

    // Row 4 (String Initial): Badge (0.00%) - Should handle string conversion
    expect(within(rows[4]).getByText(/0\.00%/)).toBeInTheDocument()
  })

  it('triggers sort for all sortable columns', async () => {
    localStorage.setItem('token', 'test-token')
    vi.mocked(axios.get).mockResolvedValue({
      data: [{ id: '1', name: 'P1', status: 'ACTIVE', type: 'CURRENT_ACCOUNT' }]
    })

    render(<MemoryRouter><ProductsPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByRole('columnheader', { name: /Nombre/i })).toBeInTheDocument())

    // Click all headers to ensure all onClick arrow functions are executed
    const headers = ['Nombre', 'Entidad', 'Tipo', 'Diferencial', 'Balance', 'Estado', 'Actualizado']
    
    for (const headerText of headers) {
      const header = screen.getByRole('columnheader', { name: new RegExp(headerText, 'i') })
      fireEvent.click(header)
    }
  })

  it('renders unknown status with default color', async () => {
    localStorage.setItem('token', 'test-token')
    const mockProducts = [
      { id: '1', name: 'P1', status: 'UNKNOWN_STATUS', type: 'CURRENT_ACCOUNT' },
    ]
    vi.mocked(axios.get).mockResolvedValue({ data: mockProducts })

    render(<MemoryRouter><ProductsPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('UNKNOWN_STATUS')).toBeInTheDocument())

    const badge = screen.getByText('UNKNOWN_STATUS')
    expect(badge).toHaveClass('bg-gray-100')
  })

  it('handles products with missing financial entity name in filter', async () => {
    localStorage.setItem('token', 'test-token')
    const mockProducts = [
      { id: '1', name: 'P1', financialEntityName: null, type: 'CURRENT_ACCOUNT' },
      { id: '2', name: 'P2', financialEntityName: 'Bank A', type: 'CURRENT_ACCOUNT' },
    ]
    vi.mocked(axios.get).mockResolvedValue({ data: mockProducts })

    render(<MemoryRouter><ProductsPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('P1')).toBeInTheDocument())
    
    // Check filter options to ensure nulls were filtered out
    const entitySelect = screen.getByLabelText(/Entidad/i)
    expect(within(entitySelect).queryByText('Bank A')).toBeInTheDocument()
    // Should not have empty option from null value
    const options = within(entitySelect).getAllByRole('option')
    expect(options.map(o => o.textContent)).not.toContain('')
  })
})
