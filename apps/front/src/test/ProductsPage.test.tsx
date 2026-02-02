import { render, screen, waitFor } from '@testing-library/react'
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
      expect(screen.getByText('Banco Santander')).toBeInTheDocument()
      expect(screen.getByText('Cuenta Corriente')).toBeInTheDocument()
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
})
