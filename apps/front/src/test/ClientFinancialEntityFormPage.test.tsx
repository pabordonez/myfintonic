import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ClientFinancialEntityFormPage } from '../features/entities/pages/ClientFinancialEntityFormPage'
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

describe('ClientFinancialEntityFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseParams.mockReturnValue({})
    localStorage.setItem('token', 'test-token')
    // Simulamos el estado real: el objeto user completo está en localStorage, no el userId suelto
    localStorage.setItem(
      'user',
      JSON.stringify({ id: 'user-123', role: 'USER' })
    )
  })

  it('renders create form with catalog', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: [{ id: 'bank-1', name: 'Santander' }],
    })

    render(
      <MemoryRouter>
        <ClientFinancialEntityFormPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByLabelText(/Entidad Financiera/i)).toBeInTheDocument()
    )
    expect(screen.getByText('Santander')).toBeInTheDocument()
    expect(screen.getByText(/Vincular Entidad/i)).toBeInTheDocument()
  })

  it('submits new association', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: [{ id: 'bank-1', name: 'Santander' }],
    })
    vi.mocked(axios.post).mockResolvedValue({})

    render(
      <MemoryRouter>
        <ClientFinancialEntityFormPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByLabelText(/Entidad Financiera/i)).toBeInTheDocument()
    )

    fireEvent.change(screen.getByLabelText(/Entidad Financiera/i), {
      target: { value: 'bank-1' },
    })
    fireEvent.change(screen.getByLabelText(/Balance/i), {
      target: { value: '1000' },
    })

    fireEvent.click(screen.getByText(/Guardar/i))

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/clients/user-123/financial-entities`,
        expect.objectContaining({ financialEntityId: 'bank-1', balance: 1000 }),
        expect.any(Object)
      )
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('renders edit form with readonly entity', async () => {
    mockUseParams.mockReturnValue({ id: 'assoc-1' })
    vi.mocked(axios.get).mockImplementation((url) => {
      if (url.includes('/financial-entities') && !url.includes('/clients/')) {
        return Promise.resolve({ data: [{ id: 'bank-1', name: 'Santander' }] })
      }
      if (url.includes('/clients/user-123/financial-entities/assoc-1')) {
        return Promise.resolve({
          data: { id: 'assoc-1', financialEntityId: 'bank-1', balance: 500 },
        })
      }
      return Promise.reject(new Error('not found'))
    })

    render(
      <MemoryRouter>
        <ClientFinancialEntityFormPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByDisplayValue('500')).toBeInTheDocument()
    )
    expect(screen.getByLabelText(/Entidad Financiera/i)).toBeDisabled()
  })

  it('updates existing association', async () => {
    mockUseParams.mockReturnValue({ id: 'assoc-1' })
    vi.mocked(axios.get).mockResolvedValue({ data: [] }) // Catalog mock simplified
    vi.mocked(axios.get).mockImplementation((url) => {
      if (url.includes('/financial-entities') && !url.includes('/clients/')) {
        return Promise.resolve({ data: [{ id: 'bank-1', name: 'Santander' }] })
      }
      return Promise.resolve({
        data: { id: 'assoc-1', financialEntityId: 'bank-1', balance: 500 },
      })
    })
    vi.mocked(axios.put).mockResolvedValue({})

    render(
      <MemoryRouter>
        <ClientFinancialEntityFormPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByLabelText(/Balance/i)).toBeInTheDocument()
    )

    fireEvent.change(screen.getByLabelText(/Balance/i), {
      target: { value: '600' },
    })
    fireEvent.click(screen.getByText(/Guardar/i))

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining(
          `${API_URL}/clients/user-123/financial-entities/assoc-1`
        ),
        expect.objectContaining({ balance: 600 }),
        expect.any(Object)
      )
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('displays server error message on failure', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: [{ id: 'bank-1', name: 'Santander' }],
    })
    vi.mocked(axios.post).mockRejectedValue({
      response: { data: { error: 'Association already exists' } },
    })
    vi.mocked(axios.isAxiosError).mockReturnValue(true)

    render(
      <MemoryRouter>
        <ClientFinancialEntityFormPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByLabelText(/Entidad Financiera/i)).toBeInTheDocument()
    )

    fireEvent.change(screen.getByLabelText(/Entidad Financiera/i), {
      target: { value: 'bank-1' },
    })
    fireEvent.change(screen.getByLabelText(/Balance/i), {
      target: { value: '1000' },
    })

    fireEvent.click(screen.getByText(/Guardar/i))

    await waitFor(() =>
      expect(screen.getByText('Association already exists')).toBeInTheDocument()
    )
  })
})
