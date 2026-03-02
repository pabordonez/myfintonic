import {
  render,
  screen,
  waitFor,
  fireEvent,
  createEvent,
} from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProductFormPage } from '../features/products/pages/ProductFormPage'
import { api } from '../config/api'
import { MemoryRouter } from 'react-router-dom'

const { mockNavigate, mockUseParams } = vi.hoisted(() => {
  return {
    mockNavigate: vi.fn(),
    mockUseParams: vi.fn().mockReturnValue({}),
  }
})

vi.mock('../config/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  },
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: mockUseParams,
  }
})

describe('ProductFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseParams.mockReturnValue({}) // Por defecto modo crear (sin ID)
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: 'user-123',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        role: 'USER',
      })
    )
  })

  it('renders create form with type selection enabled', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [{ id: 'ent-1', name: 'Banco Santander' }],
    })

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument()
    )
    expect(screen.getByText(/Crear Producto/i)).toBeInTheDocument()

    const typeSelect = screen.getByLabelText(/Tipo/i)
    expect(typeSelect).toBeEnabled()
    expect(screen.queryByText(/Eliminar/i)).not.toBeInTheDocument()
  })

  it('renders edit form with type selection disabled/fixed', async () => {
    mockUseParams.mockReturnValue({ id: 'prod-1' })
    const mockProduct = {
      id: 'prod-1',
      name: 'Cuenta Vieja',
      type: 'CURRENT_ACCOUNT',
      financialEntityId: 'ent-1',
      currentBalance: 500,
    }
    vi.mocked(api.get)
      .mockResolvedValueOnce({
        data: [{ id: 'ent-1', name: 'Banco Santander' }],
      }) // Entities
      .mockResolvedValueOnce({ data: mockProduct }) // Product

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByDisplayValue('Cuenta Vieja')).toBeInTheDocument()
    )
    expect(screen.getByText(/Editar Producto/i)).toBeInTheDocument()

    // Type should be fixed or disabled in edit mode
    const typeSelect = screen.getByLabelText(/Tipo/i)
    expect(typeSelect).toHaveAttribute('aria-disabled', 'true')

    expect(screen.getByText(/Eliminar/i)).toBeInTheDocument()
  })

  it('shows specific fields when changing product type', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByLabelText(/Tipo/i)).toBeInTheDocument()
    )

    // Select Fixed Term Deposit -> Should show Maturity Date
    fireEvent.change(screen.getByLabelText(/Tipo/i), {
      target: { value: 'FIXED_TERM_DEPOSIT' },
    })
    expect(screen.getByLabelText(/Fecha Vencimiento/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Fecha Inicio/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Tasa de Interés Anual/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Frecuencia de Pago/i)).toBeInTheDocument()

    // Select Savings Account -> Should show Monthly Interest Rate
    fireEvent.change(screen.getByLabelText(/Tipo/i), {
      target: { value: 'SAVINGS_ACCOUNT' },
    })
    expect(
      screen.getByLabelText(/Tasa de Interés Mensual/i)
    ).toBeInTheDocument()

    // Select Investment Fund
    fireEvent.change(screen.getByLabelText(/Tipo/i), {
      target: { value: 'INVESTMENT_FUND' },
    })
    expect(screen.getByLabelText(/Participaciones/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Valor Liquidativo/i)).toBeInTheDocument()

    // Select Stocks -> Should show Number of Shares
    fireEvent.change(screen.getByLabelText(/Tipo/i), {
      target: { value: 'STOCKS' },
    })
    expect(screen.getByLabelText(/Acciones/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Precio Compra/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Precio Mercado/i)).toBeInTheDocument()

    expect(
      screen.queryByLabelText(/Fecha Vencimiento/i)
    ).not.toBeInTheDocument()
  })

  it('submits new product successfully', async () => {
    vi.mocked(api.get).mockImplementation((url) => {
      if (url.includes('/financial-entities')) {
        return Promise.resolve({
          data: [{ id: 'ent-1', name: 'Banco Santander' }],
        })
      }
      return Promise.resolve({ data: [] })
    })

    // FIX: La respuesta del mock debe cumplir con ProductSchema para que el servicio no falle
    vi.mocked(api.post).mockResolvedValue({
      data: {
        id: 'new-prod',
        name: 'Mi Cuenta',
        type: 'CURRENT_ACCOUNT',
      },
    })

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      const entitySelect = screen.getByLabelText(
        /Entidad/i
      ) as HTMLSelectElement
      expect(entitySelect.options.length).toBeGreaterThan(1)
    })

    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: 'Mi Cuenta' },
    })
    fireEvent.change(screen.getByLabelText(/Tipo/i), {
      target: { value: 'CURRENT_ACCOUNT' },
    })
    fireEvent.change(screen.getByLabelText(/Entidad/i), {
      target: { value: 'ent-1' },
    })
    fireEvent.change(screen.getByLabelText(/Balance/i), {
      target: { value: '1000' },
    })

    // FIX: Forzar validación de campos requeridos para asegurar envío
    // Force validation of required fields to ensure form is valid for RHF
    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: 'Mi Cuenta' },
    })
    fireEvent.change(screen.getByLabelText(/Tipo/i), {
      target: { value: 'CURRENT_ACCOUNT' },
    })
    fireEvent.change(screen.getByLabelText(/Entidad/i), {
      target: { value: 'ent-1' },
    })

    fireEvent.click(screen.getByText(/Guardar/i))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        expect.stringContaining('/products'),
        expect.objectContaining({
          name: 'Mi Cuenta',
          type: 'CURRENT_ACCOUNT',
          financialEntity: 'ent-1',
        })
      )
      expect(
        screen.getByText('Producto creado correctamente')
      ).toBeInTheDocument()
      expect(mockNavigate).not.toHaveBeenCalledWith('/products')
    })
  })

  it('allows editing initialBalance for FIXED_TERM_DEPOSIT in edit mode', async () => {
    mockUseParams.mockReturnValue({ id: 'dep-1' })
    const mockDeposit = {
      id: 'dep-1',
      name: 'My Deposit',
      type: 'FIXED_TERM_DEPOSIT',
      financialEntityId: 'ent-1',
      initialBalance: 10000,
      currentBalance: 10500,
      status: 'ACTIVE',
      initialDate: '2023-01-01T00:00:00Z',
      maturityDate: '2024-01-01T00:00:00Z',
      annualInterestRate: 0.05,
      interestPaymentFreq: 'Annual',
    }

    vi.mocked(api.get).mockImplementation((url) => {
      if (url.includes('/financial-entities')) {
        return Promise.resolve({ data: [{ id: 'ent-1', name: 'Bank' }] })
      }
      if (url.includes('/products/dep-1')) {
        return Promise.resolve({ data: mockDeposit })
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`))
    })

    vi.mocked(api.put).mockResolvedValue({
      data: { ...mockDeposit, initialBalance: 12000 },
    })

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )

    // 1. Wait for form to load data successfully
    await waitFor(() =>
      expect(screen.getByDisplayValue('My Deposit')).toBeInTheDocument()
    )

    // 2. Wait for entity select to be populated
    await waitFor(() => {
      const entitySelect = screen.getByLabelText(
        /Entidad/i
      ) as HTMLSelectElement
      expect(entitySelect.options.length).toBeGreaterThan(1)
    })

    // Check for Initial Balance input
    const initialBalanceInput = screen.getByLabelText(/Balance Inicial/i)
    expect(initialBalanceInput).toBeInTheDocument()
    expect(initialBalanceInput).toHaveValue(10000)

    // Update Initial Balance
    fireEvent.change(initialBalanceInput, { target: { value: '12000' } })
    fireEvent.blur(initialBalanceInput)

    // Force validation of required fields to ensure form is valid for RHF
    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: 'My Deposit' },
    })
    fireEvent.change(screen.getByLabelText(/Tipo/i), {
      target: { value: 'FIXED_TERM_DEPOSIT' },
    })
    fireEvent.change(screen.getByLabelText(/Entidad/i), {
      target: { value: 'ent-1' },
    })

    // Submit
    fireEvent.click(screen.getByText(/Guardar/i))

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        expect.stringContaining('/products/dep-1'),
        expect.objectContaining({
          initialBalance: 12000,
          currentBalance: 10500,
        })
      )
    })
  })

  it('deletes product from edit form', async () => {
    mockUseParams.mockReturnValue({ id: 'prod-1' })
    const mockProduct = {
      id: 'prod-1',
      name: 'Cuenta Vieja',
      type: 'CURRENT_ACCOUNT',
      financialEntity: 'ent-1',
      currentBalance: 500,
    }
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: mockProduct })
    vi.mocked(api.delete).mockResolvedValue({})
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockImplementation(() => true)

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByText(/Eliminar/i)).toBeInTheDocument()
    )

    fireEvent.click(screen.getByText(/Eliminar/i))

    expect(confirmSpy).toHaveBeenCalled()
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith(
        expect.stringContaining('/products/prod-1')
      )
      expect(mockNavigate).toHaveBeenCalledWith('/products')
    })
    confirmSpy.mockRestore()
  })

  it('should not send clientId in payload during update', async () => {
    mockUseParams.mockReturnValue({ id: 'prod-1' })
    const mockProduct = {
      id: 'prod-1',
      name: 'Cuenta Vieja',
      type: 'CURRENT_ACCOUNT',
      financialEntityId: 'ent-1',
      currentBalance: 500,
      clientId: 'user-123',
    }

    vi.mocked(api.get)
      .mockResolvedValueOnce({
        data: [{ id: 'ent-1', name: 'Banco Santander' }],
      })
      .mockResolvedValueOnce({ data: mockProduct })

    vi.mocked(api.put).mockResolvedValue({})

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByDisplayValue('Cuenta Vieja')).toBeInTheDocument()
    )

    fireEvent.click(screen.getByText(/Guardar/i))

    await waitFor(() => {
      const putCall = vi.mocked(api.put).mock.calls[0]
      const payload = putCall[1] as any
      expect(payload.clientId).toBeUndefined()
    })
  })

  it('should display currentBalance for deposits in edit mode and submit it correctly', async () => {
    mockUseParams.mockReturnValue({ id: 'prod-deposit-1' })
    const mockDeposit = {
      id: 'prod-deposit-1',
      name: 'Mi Depósito',
      type: 'FIXED_TERM_DEPOSIT',
      financialEntityId: 'ent-1',
      initialBalance: 7500,
      currentBalance: 7600, // Now deposits have currentBalance for tracking
    }

    vi.mocked(api.get)
      .mockResolvedValueOnce({
        data: [{ id: 'ent-1', name: 'Banco Santander' }],
      }) // entities
      .mockResolvedValueOnce({ data: mockDeposit }) // product

    vi.mocked(api.put).mockResolvedValue({})

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )

    // 1. Check if the currentBalance is displayed in the balance field (or initial if current is null)
    await waitFor(() => {
      const balanceInput = screen.getByLabelText(/^Balance$/i)
      expect(balanceInput).toHaveValue(7600)
    })

    // 2. Change the value and submit
    const balanceInput = screen.getByLabelText(/^Balance$/i)
    fireEvent.change(balanceInput, { target: { value: '8000' } })
    fireEvent.click(screen.getByText(/Guardar/i))

    // 3. Check if the submitted payload has currentBalance updated
    await waitFor(() => {
      const putCall = vi.mocked(api.put).mock.calls[0]
      const payload = putCall[1] as any

      expect(payload).toHaveProperty('currentBalance', 8000)
      // initialBalance should not be updated or sent if we only want to update current value
    })
  })

  it('submits INVESTMENT_FUND with correct numeric fields', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [{ id: 'ent-1', name: 'Banco Santander' }],
    })
    vi.mocked(api.post).mockResolvedValue({ data: { id: 'new-fund' } })

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument()
    )

    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: 'Mi Fondo' },
    })
    fireEvent.change(screen.getByLabelText(/Tipo/i), {
      target: { value: 'INVESTMENT_FUND' },
    })
    fireEvent.change(screen.getByLabelText(/Entidad/i), {
      target: { value: 'ent-1' },
    })
    fireEvent.change(screen.getByLabelText(/Balance/i), {
      target: { value: '20000' },
    })

    fireEvent.change(screen.getByLabelText(/Participaciones/i), {
      target: { value: '100.5' },
    })
    fireEvent.change(screen.getByLabelText(/Valor Liquidativo/i), {
      target: { value: '199.01' },
    })

    fireEvent.click(screen.getByText(/Guardar/i))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        expect.stringContaining('/products'),
        expect.objectContaining({
          name: 'Mi Fondo',
          type: 'INVESTMENT_FUND',
          currentBalance: 20000,
          numberOfUnits: 100.5,
          netAssetValue: 199.01,
        })
      )
    })
  })

  it('submits STOCKS with correct numeric fields', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [{ id: 'ent-1', name: 'Banco Santander' }],
    })
    vi.mocked(api.post).mockResolvedValue({ data: { id: 'new-stock' } })

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument()
    )

    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: 'Mis Acciones' },
    })
    fireEvent.change(screen.getByLabelText(/Tipo/i), {
      target: { value: 'STOCKS' },
    })
    fireEvent.change(screen.getByLabelText(/Entidad/i), {
      target: { value: 'ent-1' },
    })

    fireEvent.change(screen.getByLabelText(/Acciones/i), {
      target: { value: '50' },
    })
    fireEvent.change(screen.getByLabelText(/Precio Compra/i), {
      target: { value: '90.50' },
    })
    fireEvent.change(screen.getByLabelText(/Precio Mercado/i), {
      target: { value: '100.00' },
    })

    fireEvent.click(screen.getByText(/Guardar/i))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        expect.stringContaining('/products'),
        expect.objectContaining({
          name: 'Mis Acciones',
          type: 'STOCKS',
          numberOfShares: 50,
          unitPurchasePrice: 90.5,
          currentMarketPrice: 100,
        })
      )
    })
  })

  it('renders history for CURRENT_ACCOUNT', async () => {
    mockUseParams.mockReturnValue({ id: 'prod-1' })
    const mockProduct = {
      id: 'prod-1',
      name: 'Cuenta Vieja',
      type: 'CURRENT_ACCOUNT',
      financialEntityId: 'ent-1',
      currentBalance: 500,
      initialBalance: 400,
      valueHistory: [{ date: '2023-10-01', value: 500, previousValue: 400 }],
    }

    vi.mocked(api.get)
      .mockResolvedValueOnce({
        data: [{ id: 'ent-1', name: 'Banco Santander' }],
      })
      .mockResolvedValueOnce({ data: mockProduct })

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Histórico de Valoraciones')).toBeInTheDocument()
    })
  })

  it('renders history for INVESTMENT_FUND', async () => {
    mockUseParams.mockReturnValue({ id: 'prod-2' })
    const mockProduct = {
      id: 'prod-2',
      name: 'Fondo',
      type: 'INVESTMENT_FUND',
      financialEntityId: 'ent-1',
      currentBalance: 500,
      initialBalance: 400,
      valueHistory: [{ date: '2023-10-01', value: 500, previousValue: 400 }],
    }

    vi.mocked(api.get)
      .mockResolvedValueOnce({
        data: [{ id: 'ent-1', name: 'Banco Santander' }],
      })
      .mockResolvedValueOnce({ data: mockProduct })

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Fondo')).toBeInTheDocument()
    })

    expect(screen.getByText('Histórico de Valoraciones')).toBeInTheDocument()
  })

  it('renders history for FIXED_TERM_DEPOSIT', async () => {
    mockUseParams.mockReturnValue({ id: 'prod-deposit-1' })
    const mockProduct = {
      id: 'prod-deposit-1',
      name: 'Depósito Rentable',
      type: 'FIXED_TERM_DEPOSIT',
      financialEntityId: 'ent-1',
      currentBalance: 1050,
      initialBalance: 1000,
      valueHistory: [{ date: '2023-10-01', value: 1050, previousValue: 1000 }],
    }

    vi.mocked(api.get)
      .mockResolvedValueOnce({
        data: [{ id: 'ent-1', name: 'Banco Santander' }],
      })
      .mockResolvedValueOnce({ data: mockProduct })

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Depósito Rentable')).toBeInTheDocument()
    })

    expect(screen.getByText('Histórico de Valoraciones')).toBeInTheDocument()
  })

  it('calls PUT when status is changed in edit mode', async () => {
    mockUseParams.mockReturnValue({ id: 'prod-1' })
    const mockProduct = {
      id: 'prod-1',
      name: 'Cuenta Activa',
      type: 'CURRENT_ACCOUNT',
      financialEntityId: 'ent-1',
      status: 'ACTIVE',
      currentBalance: 500,
    }

    vi.mocked(api.get)
      .mockResolvedValueOnce({
        data: [{ id: 'ent-1', name: 'Banco Santander' }],
      })
      .mockResolvedValueOnce({ data: mockProduct })

    vi.mocked(api.put).mockResolvedValue({})
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockImplementation(() => true)

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByLabelText(/Estado/i)).toBeInTheDocument()
    )

    fireEvent.change(screen.getByLabelText(/Estado/i), {
      target: { value: 'PAUSED' },
    })

    expect(confirmSpy).toHaveBeenCalled()
    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        expect.stringContaining('/products/prod-1'),
        { status: 'PAUSED' }
      )
    })
    await waitFor(() =>
      expect(screen.queryByText('Actualizando...')).not.toBeInTheDocument()
    )

    confirmSpy.mockRestore()
  })

  it('STOCKS (Create): shows Initial Balance and submits it', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [{ id: 'ent-1', name: 'Banco Santander' }],
    })
    vi.mocked(api.post).mockResolvedValue({ data: { id: 'new-stock' } })

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByLabelText(/Tipo/i)).toBeInTheDocument()
    )

    fireEvent.change(screen.getByLabelText(/Tipo/i), {
      target: { value: 'STOCKS' },
    })

    // Verificar campos específicos
    expect(screen.getByLabelText(/Balance Inicial/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/^Balance$/i)).not.toBeInTheDocument() // Balance genérico
    expect(screen.queryByLabelText(/Balance Actual/i)).not.toBeInTheDocument()

    // Rellenar formulario
    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: 'My Stock' },
    })
    fireEvent.change(screen.getByLabelText(/Entidad/i), {
      target: { value: 'ent-1' },
    })
    fireEvent.change(screen.getByLabelText(/Balance Inicial/i), {
      target: { value: '5000' },
    })
    fireEvent.change(screen.getByLabelText(/Acciones/i), {
      target: { value: '10' },
    })
    // Force validation just in case
    fireEvent.change(screen.getByLabelText(/Tipo/i), {
      target: { value: 'STOCKS' },
    })

    fireEvent.click(screen.getByText(/Guardar/i))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        expect.stringContaining('/products'),
        expect.objectContaining({
          type: 'STOCKS',
          initialBalance: 5000,
        })
      )
    })
  })

  it('STOCKS (Edit): shows Current Balance and submits it', async () => {
    mockUseParams.mockReturnValue({ id: 'stock-1' })
    const mockStock = {
      id: 'stock-1',
      name: 'My Stock',
      type: 'STOCKS',
      financialEntityId: 'ent-1',
      currentBalance: 6000,
      initialBalance: 5000,
      numberOfShares: 10,
    }

    vi.mocked(api.get)
      .mockResolvedValueOnce({
        data: [{ id: 'ent-1', name: 'Banco Santander' }],
      })
      .mockResolvedValueOnce({ data: mockStock })

    vi.mocked(api.put).mockResolvedValue({})

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByDisplayValue('My Stock')).toBeInTheDocument()
    )

    // Verificar campos específicos de edición
    expect(screen.getByLabelText(/Balance Actual/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/Balance Inicial/i)).not.toBeInTheDocument()

    // Actualizar balance
    fireEvent.change(screen.getByLabelText(/Balance Actual/i), {
      target: { value: '6500' },
    })

    fireEvent.click(screen.getByText(/Guardar/i))

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        expect.stringContaining('/products/stock-1'),
        expect.objectContaining({
          currentBalance: 6500,
        })
      )
    })
  })

  it('INVESTMENT_FUND (Edit): should not send initialBalance in payload', async () => {
    mockUseParams.mockReturnValue({ id: 'fund-1' })
    const mockFund = {
      id: 'fund-1',
      name: 'My Fund',
      type: 'INVESTMENT_FUND',
      financialEntityId: 'ent-1',
      currentBalance: 20000,
      initialBalance: 15000,
      numberOfUnits: 100,
      netAssetValue: 200,
      status: 'ACTIVE',
    }

    vi.mocked(api.get)
      .mockResolvedValueOnce({
        data: [{ id: 'ent-1', name: 'Banco Santander' }],
      })
      .mockResolvedValueOnce({ data: mockFund })

    vi.mocked(api.put).mockResolvedValue({})

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByDisplayValue('My Fund')).toBeInTheDocument()
    )

    fireEvent.click(screen.getByText(/Guardar/i))

    await waitFor(() => {
      const putCall = vi.mocked(api.put).mock.calls[0]
      const payload = putCall[1] as any
      expect(payload).not.toHaveProperty('initialBalance')
    })
  })

  it('displays error message on load failure', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Load failed'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByText('Error al cargar los datos')).toBeInTheDocument()
    )
    consoleSpy.mockRestore()
  })

  it('displays error message on submit failure', async () => {
    vi.mocked(api.get).mockImplementation((url) => {
      if (url.includes('/financial-entities')) {
        return Promise.resolve({
          data: [{ id: 'ent-1', name: 'Banco Santander' }],
        })
      }
      return Promise.resolve({ data: [] })
    })
    vi.mocked(api.post).mockRejectedValue(new Error('Submit failed'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )

    // Wait for entities to load before filling the form
    await waitFor(() =>
      expect(screen.getByText('Banco Santander')).toBeInTheDocument()
    )

    // Fill required fields to pass validation
    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: 'Test Product' },
    })
    fireEvent.change(screen.getByLabelText(/Tipo/i), {
      target: { value: 'CURRENT_ACCOUNT' },
    })
    fireEvent.change(screen.getByLabelText(/Entidad/i), {
      target: { value: 'ent-1' },
    })

    fireEvent.click(screen.getByText(/Guardar/i))

    await waitFor(() =>
      expect(
        screen.getByText('Error al guardar el producto')
      ).toBeInTheDocument()
    )
    consoleSpy.mockRestore()
  })

  it('displays error on delete failure', async () => {
    mockUseParams.mockReturnValue({ id: 'prod-1' })
    const mockProduct = {
      id: 'prod-1',
      name: 'P1',
      type: 'CURRENT_ACCOUNT',
      financialEntityId: 'ent-1',
    }
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: [{ id: 'ent-1', name: 'Bank' }] })
      .mockResolvedValueOnce({ data: mockProduct })
    vi.mocked(api.delete).mockRejectedValue(new Error('Delete failed'))
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )
    await waitFor(() =>
      expect(screen.getByText(/Eliminar/i)).toBeInTheDocument()
    )

    fireEvent.click(screen.getByText(/Eliminar/i))

    await waitFor(() =>
      expect(
        screen.getByText('Error al eliminar el producto')
      ).toBeInTheDocument()
    )
    consoleSpy.mockRestore()
  })

  it('handles missing user gracefully', async () => {
    const getItemSpy = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation((key) => {
        if (key === 'token') return 'test-token'
        if (key === 'user') return null // Force user missing
        return null
      })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )
    await waitFor(() =>
      expect(screen.getByText('Error al cargar los datos')).toBeInTheDocument()
    )
    consoleSpy.mockRestore()
    getItemSpy.mockRestore()
  })

  it('handles missing user gracefully', async () => {
    const getItemSpy = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation((key) => {
        if (key === 'token') return 'test-token'
        if (key === 'user') return null
        return null
      })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )
    await waitFor(() =>
      expect(screen.getByText('Error al cargar los datos')).toBeInTheDocument()
    )
    consoleSpy.mockRestore()
    getItemSpy.mockRestore()
  })

  it('cancels status change', async () => {
    mockUseParams.mockReturnValue({ id: 'prod-1' })
    const mockProduct = {
      id: 'prod-1',
      name: 'P1',
      type: 'CURRENT_ACCOUNT',
      financialEntityId: 'ent-1',
      status: 'ACTIVE',
    }
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: [{ id: 'ent-1', name: 'Bank' }] })
      .mockResolvedValueOnce({ data: mockProduct })

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )
    await waitFor(() =>
      expect(screen.getByLabelText(/Estado/i)).toBeInTheDocument()
    )

    // Usamos createEvent para poder espiar preventDefault
    const select = screen.getByLabelText(/Estado/i)
    const event = createEvent.change(select, { target: { value: 'PAUSED' } })
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

    fireEvent(select, event)

    expect(confirmSpy).toHaveBeenCalled()
    expect(preventDefaultSpy).toHaveBeenCalled()
    expect(api.put).not.toHaveBeenCalled()
    confirmSpy.mockRestore()
  })

  it('displays error on status change failure', async () => {
    mockUseParams.mockReturnValue({ id: 'prod-1' })
    const mockProduct = {
      id: 'prod-1',
      name: 'P1',
      type: 'CURRENT_ACCOUNT',
      financialEntityId: 'ent-1',
      status: 'ACTIVE',
    }
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: [{ id: 'ent-1', name: 'Bank' }] })
      .mockResolvedValueOnce({ data: mockProduct })
    vi.mocked(api.put).mockRejectedValue(new Error('Put failed'))
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )
    await waitFor(() =>
      expect(screen.getByLabelText(/Estado/i)).toBeInTheDocument()
    )

    fireEvent.change(screen.getByLabelText(/Estado/i), {
      target: { value: 'PAUSED' },
    })

    await waitFor(() =>
      expect(
        screen.getByText('Error al actualizar el estado')
      ).toBeInTheDocument()
    )
    consoleSpy.mockRestore()
  })

  it('cancels delete action', async () => {
    mockUseParams.mockReturnValue({ id: 'prod-1' })
    const mockProduct = {
      id: 'prod-1',
      name: 'Cuenta Vieja',
      type: 'CURRENT_ACCOUNT',
      financialEntityId: 'ent-1',
      currentBalance: 500,
    }
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: mockProduct })

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByText(/Eliminar/i)).toBeInTheDocument()
    )

    fireEvent.click(screen.getByText(/Eliminar/i))

    expect(confirmSpy).toHaveBeenCalled()
    expect(api.delete).not.toHaveBeenCalled()
    confirmSpy.mockRestore()
  })

  it('removes empty string fields before submission', async () => {
    vi.mocked(api.get).mockImplementation((url) => {
      if (url.includes('/financial-entities')) {
        return Promise.resolve({ data: [{ id: 'ent-1', name: 'Bank' }] })
      }
      return Promise.resolve({ data: [] })
    })
    // FIX: La respuesta del mock debe cumplir con ProductSchema
    vi.mocked(api.post).mockResolvedValue({
      data: { id: 'new-prod', name: 'Test Product', type: 'CURRENT_ACCOUNT' },
    })

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )
    await waitFor(() =>
      expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument()
    )

    // Rellenar campos requeridos
    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: 'Test Product' },
    })

    fireEvent.change(screen.getByLabelText(/Tipo/i), {
      target: { value: 'CURRENT_ACCOUNT' },
    })
    fireEvent.change(screen.getByLabelText(/Entidad/i), {
      target: { value: 'ent-1' },
    })

    // Rellenar un campo numérico opcional con cadena vacía para verificar que se envía como undefined
    const balanceInput = screen.getByLabelText(/Balance/i)
    fireEvent.change(balanceInput, { target: { value: '' } })

    // Enviar formulario
    fireEvent.click(screen.getByText(/Guardar/i))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled()
      const postCall = vi.mocked(api.post).mock.calls[0]
      const payload = postCall[1] as any
      // Verificar que currentBalance es undefined (transformado por Zod optionalNumber)
      expect(payload.currentBalance).toBeUndefined()
      expect(payload.name).toBe('Test Product')
    })
  })

  it('renders edit form for FIXED_TERM_DEPOSIT with dates', async () => {
    mockUseParams.mockReturnValue({ id: 'deposit-1' })
    const mockDeposit = {
      id: 'deposit-1',
      name: 'My Deposit',
      type: 'FIXED_TERM_DEPOSIT',
      financialEntityId: 'ent-1',
      initialBalance: 1000,
      initialDate: '2023-01-01T00:00:00Z',
      maturityDate: '2024-01-01T00:00:00Z',
      annualInterestRate: 0.05,
      interestPaymentFreq: 'Annual',
    }

    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: [{ id: 'ent-1', name: 'Bank' }] })
      .mockResolvedValueOnce({ data: mockDeposit })

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByDisplayValue('2023-01-01')).toBeInTheDocument()
    )
    expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument()
  })

  it('validates percentage limits for interest rates', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [{ id: 'ent-1', name: 'Banco Santander' }],
    })

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByLabelText(/Tipo/i)).toBeInTheDocument()
    )

    // Select Fixed Term Deposit
    fireEvent.change(screen.getByLabelText(/Tipo/i), {
      target: { value: 'FIXED_TERM_DEPOSIT' },
    })

    // Test > 100
    const annualRateInput = screen.getByLabelText(/Tasa de Interés Anual/i)
    fireEvent.change(annualRateInput, { target: { value: '110' } })
    fireEvent.click(screen.getByText(/Guardar/i))

    await waitFor(() => {
      expect(
        screen.getByText('El porcentaje no puede ser mayor a 100')
      ).toBeInTheDocument()
    })

    // Test < 0.01
    fireEvent.change(annualRateInput, { target: { value: '0.001' } })
    fireEvent.click(screen.getByText(/Guardar/i))

    await waitFor(() => {
      expect(
        screen.getByText('El porcentaje debe ser mayor o igual a 0.01')
      ).toBeInTheDocument()
    })
  })

  it('transforms percentage to decimal on submit', async () => {
    vi.mocked(api.get).mockImplementation((url) => {
      if (url.includes('/financial-entities')) {
        return Promise.resolve({
          data: [{ id: 'ent-1', name: 'Banco Santander' }],
        })
      }
      return Promise.resolve({ data: [] })
    })
    vi.mocked(api.post).mockResolvedValue({
      data: { id: 'new-prod', name: 'Depo', type: 'FIXED_TERM_DEPOSIT' },
    })

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByLabelText(/Tipo/i)).toBeInTheDocument()
    )

    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: 'Depo' },
    })
    fireEvent.change(screen.getByLabelText(/Tipo/i), {
      target: { value: 'FIXED_TERM_DEPOSIT' },
    })
    fireEvent.change(screen.getByLabelText(/Entidad/i), {
      target: { value: 'ent-1' },
    })
    fireEvent.change(screen.getByLabelText(/^Balance$/i), {
      target: { value: '1000' },
    })
    fireEvent.change(screen.getByLabelText(/Fecha Inicio/i), {
      target: { value: '2023-01-01' },
    })
    fireEvent.change(screen.getByLabelText(/Fecha Vencimiento/i), {
      target: { value: '2024-01-01' },
    })
    fireEvent.change(screen.getByLabelText(/Frecuencia de Pago/i), {
      target: { value: 'Annual' },
    })
    fireEvent.change(screen.getByLabelText(/Tasa de Interés Anual/i), {
      target: { value: '5.5' },
    })

    fireEvent.click(screen.getByText(/Guardar/i))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        expect.stringContaining('/products'),
        expect.objectContaining({ annualInterestRate: 0.055 })
      )
    })
  })
})
