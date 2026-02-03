import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProductFormPage } from '../features/products/pages/ProductFormPage'
import axios from 'axios'
import { MemoryRouter } from 'react-router-dom'
import { API_URL } from '../config/api'

const { mockNavigate, mockUseParams } = vi.hoisted(() => {
  return {
    mockNavigate: vi.fn(),
    mockUseParams: vi.fn().mockReturnValue({}),
  }
})

vi.mock('axios')

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
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('userId', 'user-123')
  })

  it('renders create form with type selection enabled', async () => {
    vi.mocked(axios.get).mockResolvedValue({
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
    vi.mocked(axios.get)
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
    expect(typeSelect).toBeDisabled()

    expect(screen.getByText(/Eliminar/i)).toBeInTheDocument()
  })

  it('shows specific fields when changing product type', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: [] })

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
    vi.mocked(axios.get).mockResolvedValue({
      data: [{ id: 'ent-1', name: 'Banco Santander' }],
    })
    vi.mocked(axios.post).mockResolvedValue({ data: { id: 'new-prod' } })

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument()
    )

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

    fireEvent.click(screen.getByText(/Guardar/i))

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining(`${API_URL}/products`),
        expect.objectContaining({
          name: 'Mi Cuenta',
          type: 'CURRENT_ACCOUNT',
          financialEntity: 'ent-1',
        }),
        expect.any(Object)
      )
      expect(mockNavigate).toHaveBeenCalledWith('/products')
    })
  })

  it('updates existing product without sending type', async () => {
    mockUseParams.mockReturnValue({ id: 'prod-1' })
    const mockProduct = {
      id: 'prod-1',
      name: 'Cuenta Vieja',
      type: 'CURRENT_ACCOUNT',
      financialEntity: 'ent-1',
      currentBalance: 500,
    }

    vi.mocked(axios.get)
      .mockResolvedValueOnce({
        data: [{ id: 'ent-1', name: 'Banco Santander' }],
      })
      .mockResolvedValueOnce({ data: mockProduct })

    vi.mocked(axios.put).mockResolvedValue({})

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByDisplayValue('Cuenta Vieja')).toBeInTheDocument()
    )

    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: 'Cuenta Actualizada' },
    })
    fireEvent.click(screen.getByText(/Guardar/i))

    await waitFor(() => {
      // Verify type is NOT in the payload
      const putCall = vi.mocked(axios.put).mock.calls[0]
      const payload = putCall[1] as any
      expect(payload.name).toBe('Cuenta Actualizada')
      expect(payload.type).toBeUndefined()
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
    vi.mocked(axios.get)
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: mockProduct })
    vi.mocked(axios.delete).mockResolvedValue({})
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
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining(`${API_URL}/products/prod-1`),
        expect.any(Object)
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

    vi.mocked(axios.get)
      .mockResolvedValueOnce({
        data: [{ id: 'ent-1', name: 'Banco Santander' }],
      })
      .mockResolvedValueOnce({ data: mockProduct })

    vi.mocked(axios.put).mockResolvedValue({})

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
      const putCall = vi.mocked(axios.put).mock.calls[0]
      const payload = putCall[1] as any
      expect(payload.clientId).toBeUndefined()
    })
  })

  it('should display initialBalance for deposits and submit it correctly', async () => {
    mockUseParams.mockReturnValue({ id: 'prod-deposit-1' })
    const mockDeposit = {
      id: 'prod-deposit-1',
      name: 'Mi Depósito',
      type: 'FIXED_TERM_DEPOSIT',
      financialEntityId: 'ent-1',
      initialBalance: 7500,
      currentBalance: null, // This is key, as deposits don't have currentBalance
    }

    vi.mocked(axios.get)
      .mockResolvedValueOnce({
        data: [{ id: 'ent-1', name: 'Banco Santander' }],
      }) // entities
      .mockResolvedValueOnce({ data: mockDeposit }) // product

    vi.mocked(axios.put).mockResolvedValue({})

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )

    // 1. Check if the initialBalance is displayed in the balance field
    await waitFor(() => {
      const balanceInput = screen.getByLabelText(/Balance/i)
      expect(balanceInput).toHaveValue(7500)
    })

    // 2. Change the value and submit
    const balanceInput = screen.getByLabelText(/Balance/i)
    fireEvent.change(balanceInput, { target: { value: '8000' } })
    fireEvent.click(screen.getByText(/Guardar/i))

    // 3. Check if the submitted payload has initialBalance and not currentBalance
    await waitFor(() => {
      const putCall = vi.mocked(axios.put).mock.calls[0]
      const payload = putCall[1] as any

      expect(payload).toHaveProperty('initialBalance', 8000)
      expect(payload).not.toHaveProperty('currentBalance')
    })
  })

  it('submits INVESTMENT_FUND with correct numeric fields', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: [{ id: 'ent-1', name: 'Banco Santander' }],
    })
    vi.mocked(axios.post).mockResolvedValue({ data: { id: 'new-fund' } })

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
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining(`${API_URL}/products`),
        expect.objectContaining({
          name: 'Mi Fondo',
          type: 'INVESTMENT_FUND',
          currentBalance: 20000,
          numberOfUnits: 100.5,
          netAssetValue: 199.01,
        }),
        expect.any(Object)
      )
    })
  })

  it('submits STOCKS with correct numeric fields', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: [{ id: 'ent-1', name: 'Banco Santander' }],
    })
    vi.mocked(axios.post).mockResolvedValue({ data: { id: 'new-stock' } })

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
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining(`${API_URL}/products`),
        expect.objectContaining({
          name: 'Mis Acciones',
          type: 'STOCKS',
          numberOfShares: 50,
          unitPurchasePrice: 90.5,
          currentMarketPrice: 100,
        }),
        expect.any(Object)
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
      valueHistory: [
        { date: '2023-10-01', value: 500, previousValue: 400 }
      ]
    }

    vi.mocked(axios.get)
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
      valueHistory: [
        { date: '2023-10-01', value: 500, previousValue: 400 }
      ]
    }

    vi.mocked(axios.get)
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

  it('calls PATCH when status is changed in edit mode', async () => {
    mockUseParams.mockReturnValue({ id: 'prod-1' })
    const mockProduct = {
      id: 'prod-1',
      name: 'Cuenta Activa',
      type: 'CURRENT_ACCOUNT',
      financialEntityId: 'ent-1',
      status: 'ACTIVE',
      currentBalance: 500,
    }

    vi.mocked(axios.get)
      .mockResolvedValueOnce({
        data: [{ id: 'ent-1', name: 'Banco Santander' }],
      })
      .mockResolvedValueOnce({ data: mockProduct })

    vi.mocked(axios.patch).mockResolvedValue({})
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true)

    render(
      <MemoryRouter>
        <ProductFormPage />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByLabelText(/Estado/i)).toBeInTheDocument())

    fireEvent.change(screen.getByLabelText(/Estado/i), {
      target: { value: 'PAUSED' },
    })

    expect(confirmSpy).toHaveBeenCalled()
    expect(axios.patch).toHaveBeenCalledWith(
      expect.stringContaining(`${API_URL}/products/prod-1`),
      { status: 'PAUSED' },
      expect.any(Object)
    )
    
    confirmSpy.mockRestore()
  })
})
