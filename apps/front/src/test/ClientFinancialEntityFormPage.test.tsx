import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ClientFinancialEntityFormPage } from '../features/client-financial-entities/pages/ClientFinancialEntityFormPage'
import axios from 'axios'
import { MemoryRouter } from 'react-router-dom'
import { API_URL } from '../config/api'

const { mockNavigate, mockUseParams, mockUseAuth } = vi.hoisted(() => {
  return {
    mockNavigate: vi.fn(),
    mockUseParams: vi.fn().mockReturnValue({}),
    mockUseAuth: vi.fn(),
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

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('ClientFinancialEntityFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseParams.mockReturnValue({})
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123', role: 'USER' },
      token: 'test-token',
    })
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
      expect(screen.getByText('Entidad creada correctamente')).toBeInTheDocument()
      expect(mockNavigate).not.toHaveBeenCalledWith('/dashboard')
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
      expect(screen.getByText('Entidad actualizada correctamente')).toBeInTheDocument()
      expect(mockNavigate).not.toHaveBeenCalledWith('/dashboard')
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

  it('displays error message on load failure', async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error('Load failed'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <ClientFinancialEntityFormPage />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Error al cargar datos')).toBeInTheDocument())
    consoleSpy.mockRestore()
  })

  it('displays generic error message on submit failure', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: [{ id: 'bank-1', name: 'Santander' }] })
    vi.mocked(axios.post).mockRejectedValue(new Error('Network error'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <ClientFinancialEntityFormPage />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByLabelText(/Entidad Financiera/i)).toBeInTheDocument())

    fireEvent.change(screen.getByLabelText(/Entidad Financiera/i), {
      target: { value: 'bank-1' },
    })
    fireEvent.change(screen.getByLabelText(/Balance/i), {
      target: { value: '1000' },
    })

    fireEvent.click(screen.getByText(/Guardar/i))

    await waitFor(() => expect(screen.getByText('Error al guardar')).toBeInTheDocument())
    consoleSpy.mockRestore()
  })

  it('handles missing user ID gracefully', async () => {
    mockUseAuth.mockReturnValue({ user: null, token: 'test-token' })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <ClientFinancialEntityFormPage />
      </MemoryRouter>
    )
    await waitFor(() => expect(screen.queryByText('Error al cargar datos')).not.toBeInTheDocument())
    consoleSpy.mockRestore()
  })

  it('handles missing token gracefully', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-123', role: 'USER' }, token: null })
    vi.mocked(axios.get).mockRejectedValue(new Error('Unauthorized'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <ClientFinancialEntityFormPage />
      </MemoryRouter>
    )
    await waitFor(() => expect(screen.getByText('Error al cargar datos')).toBeInTheDocument())
    consoleSpy.mockRestore()
  })

  it('renders value history in edit mode', async () => {
    mockUseParams.mockReturnValue({ id: 'assoc-1' })
    vi.mocked(axios.get).mockImplementation((url) => {

      if (url.includes('/financial-entities') && !url.includes('/clients/')) {
        return Promise.resolve({ data: [{ id: 'bank-1', name: 'Santander' }] })
      }
      return Promise.resolve({
        data: { 
            id: 'assoc-1', 
            financialEntityId: 'bank-1', 
            balance: 500,
            initialBalance: 400,
            valueHistory: [{ date: '2023-01-01', value: 500, previousValue: 400 }]
        },
      })
    })

    render(<MemoryRouter><ClientFinancialEntityFormPage /></MemoryRouter>)

    await waitFor(() => expect(screen.getByDisplayValue('500')).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText('Histórico de Valoraciones')).toBeInTheDocument())
    expect(screen.getByText('01/01/2023')).toBeInTheDocument()
  })

  it('navigates back when "Volver" is clicked', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: [] })
    render(
      <MemoryRouter>
        <ClientFinancialEntityFormPage />
      </MemoryRouter>
    )
    await waitFor(() => expect(screen.getByText('Volver')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Volver'))
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })
})
