import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { ProductTransactionButton } from '../features/products/components/ProductTransactionButton'
import { TransactionFormPage } from '../features/products/pages/TransactionFormPage'
import { TransactionListPage } from '../features/products/pages/TransactionListPage'
import { ProductType } from '../features/products/types/transaction.types'
import { api } from '../config/api'

const { mockNavigate, mockUseParams } = vi.hoisted(() => {
  return {
    mockNavigate: vi.fn(),
    mockUseParams: vi.fn().mockReturnValue({ id: '123' }),
  }
})

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useParams: mockUseParams,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../config/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  },
}))

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('Transaction Feature', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockUseParams.mockReturnValue({ id: '123' })
  })

  // Test Case 1: Verificar visibilidad del botón
  describe('ProductTransactionButton', () => {
    it('debe mostrar el botón para CURRENT_ACCOUNT', () => {
      renderWithRouter(
        <ProductTransactionButton
          productType={ProductType.CURRENT_ACCOUNT}
          productId="123"
        />
      )
      expect(screen.getByText('Ver Transacciones')).toBeInTheDocument()
    })

    it('debe mostrar el botón para SAVINGS_ACCOUNT', () => {
      renderWithRouter(
        <ProductTransactionButton
          productType={ProductType.SAVINGS_ACCOUNT}
          productId="123"
        />
      )
      expect(screen.getByText('Ver Transacciones')).toBeInTheDocument()
    })

    it('NO debe mostrar el botón para INVESTMENT_FUND', () => {
      renderWithRouter(
        <ProductTransactionButton
          productType={ProductType.INVESTMENT_FUND}
          productId="123"
        />
      )
      expect(screen.queryByText('Ver Transacciones')).not.toBeInTheDocument()
    })

    it('navega a la lista de transacciones al hacer click', () => {
      renderWithRouter(
        <ProductTransactionButton
          productType={ProductType.CURRENT_ACCOUNT}
          productId="123"
        />
      )
      const button = screen.getByText('Ver Transacciones')
      fireEvent.click(button)
      expect(mockNavigate).toHaveBeenCalledWith('/products/123/transactions')
    })
  })

  // Test Case 2: TransactionFormPage
  describe('TransactionFormPage', () => {
    it('los campos deben ser requeridos', () => {
      renderWithRouter(<TransactionFormPage />)

      const descriptionInput = screen.getByLabelText(/descripción/i)
      const amountInput = screen.getByLabelText(/monto/i)
      const dateInput = screen.getByLabelText(/fecha/i)

      expect(descriptionInput).toBeRequired()
      expect(amountInput).toBeRequired()
      expect(dateInput).toBeRequired()
    })
  })

  // Test Case 3: Envío de payload correcto
  describe('TransactionFormPage Submission', () => {
    it('debe llamar a la API con el payload correcto al guardar', async () => {
      mockUseParams.mockReturnValue({ id: '123' })

      renderWithRouter(<TransactionFormPage />)

      // Rellenar formulario
      const dateValue = '2023-10-27'
      fireEvent.change(screen.getByLabelText(/fecha/i), {
        target: { value: dateValue },
      })
      fireEvent.change(screen.getByLabelText(/descripción/i), {
        target: { value: 'Salary' },
      })
      fireEvent.change(screen.getByLabelText(/monto/i), {
        target: { value: '1500.50' },
      })

      // Enviar
      const saveButton = screen.getByRole('button', { name: /guardar/i })
      fireEvent.click(saveButton)

      // Verificar estado de carga
      expect(screen.getByText('Guardando...')).toBeInTheDocument()

      // Verificar llamada a API
      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/products/123/transactions', {
          description: 'Salary',
          amount: 1500.5,
          date: expect.stringContaining(dateValue),
        })
      })
    })

    it('maneja errores del servidor al guardar', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockUseParams.mockReturnValue({ id: '123' })
      vi.mocked(api.post).mockRejectedValue(new Error('Error de red'))

      renderWithRouter(<TransactionFormPage />)

      // Rellenar mínimamente para poder enviar
      fireEvent.change(screen.getByLabelText(/descripción/i), {
        target: { value: 'Test' },
      })
      fireEvent.change(screen.getByLabelText(/monto/i), {
        target: { value: '100' },
      })

      const saveButton = screen.getByRole('button', { name: /guardar/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(
          screen.getByText(/Error al guardar la transacción/i)
        ).toBeInTheDocument()
      })
      consoleSpy.mockRestore()
    })

    it('navega hacia atrás al pulsar Volver', () => {
      mockUseParams.mockReturnValue({ id: '123' })
      renderWithRouter(<TransactionFormPage />)

      const backButton = screen.getByText('Volver')
      fireEvent.click(backButton)

      expect(mockNavigate).toHaveBeenCalledWith('/products/123/transactions')
    })

    it('no envía el formulario si no hay ID de producto', async () => {
      mockUseParams.mockReturnValue({})
      renderWithRouter(<TransactionFormPage />)

      fireEvent.change(screen.getByLabelText(/fecha/i), {
        target: { value: '2023-10-27' },
      })
      fireEvent.change(screen.getByLabelText(/descripción/i), {
        target: { value: 'Test' },
      })
      fireEvent.change(screen.getByLabelText(/monto/i), {
        target: { value: '100' },
      })

      const saveButton = screen.getByRole('button', { name: /guardar/i })
      fireEvent.click(saveButton)

      expect(api.post).not.toHaveBeenCalled()
    })
  })

  // Test Case 4: TransactionListPage
  describe('TransactionListPage', () => {
    it('muestra estado de carga inicial', () => {
      mockUseParams.mockReturnValue({ id: '123' })
      vi.mocked(api.get).mockImplementation(() => new Promise(() => {})) // Promesa pendiente

      renderWithRouter(<TransactionListPage />)
      expect(screen.getByText('Cargando transacciones...')).toBeInTheDocument()
    })

    it('muestra mensaje de error si falla la carga', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockUseParams.mockReturnValue({ id: '123' })
      vi.mocked(api.get).mockRejectedValue(new Error('Error'))

      renderWithRouter(<TransactionListPage />)

      await waitFor(() => {
        expect(screen.getByText('Producto no encontrado')).toBeInTheDocument()
      })
      consoleSpy.mockRestore()
    })

    it('renderiza la lista de transacciones correctamente', async () => {
      mockUseParams.mockReturnValue({ id: '123' })
      const mockProduct = {
        id: '123',
        name: 'Cuenta Principal',
        type: 'CURRENT_ACCOUNT',
        transactions: [
          {
            date: '2023-10-01T10:00:00Z',
            description: 'Ingreso Nómina',
            amount: 2500.0,
          },
          {
            date: '2023-10-02T12:00:00Z',
            description: 'Pago Alquiler',
            amount: -800.0,
          },
        ],
      }
      vi.mocked(api.get).mockResolvedValue({ data: mockProduct })

      renderWithRouter(<TransactionListPage />)

      await waitFor(() =>
        expect(
          screen.queryByText('Cargando transacciones...')
        ).not.toBeInTheDocument()
      )
    })

    it('muestra estado vacío y botón de crear primera transacción', async () => {
      mockUseParams.mockReturnValue({ id: '123' })
      const mockProduct = {
        id: '123',
        name: 'Cuenta Nueva',
        type: 'SAVINGS_ACCOUNT',
        transactions: [],
      }
      vi.mocked(api.get).mockResolvedValue({ data: mockProduct })

      renderWithRouter(<TransactionListPage />)

      await waitFor(() => {
        expect(
          screen.getByText(
            'No hay transacciones registradas para este producto.'
          )
        ).toBeInTheDocument()
        expect(
          screen.getByText('Crear Primera Transacción')
        ).toBeInTheDocument()
      })
    })

    it('navega a nueva transacción desde el listado', async () => {
      mockUseParams.mockReturnValue({ id: '123' })
      const mockProduct = { id: '123', name: 'Cuenta', transactions: [] }
      vi.mocked(api.get).mockResolvedValue({ data: mockProduct })

      renderWithRouter(<TransactionListPage />)

      await waitFor(() => screen.getByText('Nueva Transacción'))
      fireEvent.click(screen.getByText('Nueva Transacción'))

      expect(mockNavigate).toHaveBeenCalledWith(
        '/products/123/transactions/new'
      )
    })

    it('navega volver al producto desde el listado', async () => {
      mockUseParams.mockReturnValue({ id: '123' })
      const mockProduct = { id: '123', name: 'Cuenta', transactions: [] }
      vi.mocked(api.get).mockResolvedValue({ data: mockProduct })

      renderWithRouter(<TransactionListPage />)

      await waitFor(() => screen.getByText('Volver al Producto'))
      fireEvent.click(screen.getByText('Volver al Producto'))

      expect(mockNavigate).toHaveBeenCalledWith('/products/123')
    })

    it('navega a crear transacción desde el estado vacío', async () => {
      mockUseParams.mockReturnValue({ id: '123' })
      const mockProduct = { id: '123', name: 'Cuenta', transactions: [] }
      vi.mocked(api.get).mockResolvedValue({ data: mockProduct })

      renderWithRouter(<TransactionListPage />)

      await waitFor(() => screen.getByText('Crear Primera Transacción'))
      fireEvent.click(screen.getByText('Crear Primera Transacción'))

      expect(mockNavigate).toHaveBeenCalledWith(
        '/products/123/transactions/new'
      )
    })
  })
})
