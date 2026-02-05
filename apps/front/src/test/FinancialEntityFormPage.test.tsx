import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FinancialEntityFormPage } from '../features/financial-entities/pages/FinancialEntityFormPage'
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

describe('FinancialEntityFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseParams.mockReturnValue({})
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('role', 'ADMIN')
  })

  it('redirects if not admin', async () => {
    localStorage.setItem('role', 'USER')
    render(
      <MemoryRouter>
        <FinancialEntityFormPage />
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/financial-entities')
    })
  })

  it('submits new entity', async () => {
    vi.mocked(axios.post).mockResolvedValue({})

    render(
      <MemoryRouter>
        <FinancialEntityFormPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument()
    )

    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: 'Nuevo Banco' },
    })

    fireEvent.click(screen.getByText(/Guardar/i))

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/financial-entities`,
        expect.objectContaining({ name: 'Nuevo Banco' }),
        expect.any(Object)
      )
      expect(mockNavigate).toHaveBeenCalledWith('/financial-entities')
    })
  })

  it('updates existing entity', async () => {
    mockUseParams.mockReturnValue({ id: 'ent-1' })
    vi.mocked(axios.get).mockResolvedValue({
      data: { id: 'ent-1', name: 'Banco Viejo' },
    })
    vi.mocked(axios.put).mockResolvedValue({})

    render(
      <MemoryRouter>
        <FinancialEntityFormPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByDisplayValue('Banco Viejo')).toBeInTheDocument()
    )

    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: 'Banco Actualizado' },
    })
    fireEvent.click(screen.getByText(/Guardar/i))

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        `${API_URL}/financial-entities/ent-1`,
        expect.objectContaining({ name: 'Banco Actualizado' }),
        expect.any(Object)
      )
    })
  })

  it('displays error message on load failure', async () => {
    mockUseParams.mockReturnValue({ id: 'ent-1' })
    vi.mocked(axios.get).mockRejectedValue(new Error('Load failed'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <FinancialEntityFormPage />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText(/Error/i)).toBeInTheDocument())
    consoleSpy.mockRestore()
  })

  it('displays error message on submit failure', async () => {
    vi.mocked(axios.post).mockRejectedValue(new Error('Submit failed'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<MemoryRouter><FinancialEntityFormPage /></MemoryRouter>)

    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'New Bank' } })
    fireEvent.click(screen.getByText(/Guardar/i))

    await waitFor(() => expect(screen.getByText(/Error/i)).toBeInTheDocument())
    consoleSpy.mockRestore()
  })

  it('shows validation error when submitting empty form', async () => {
    render(<MemoryRouter><FinancialEntityFormPage /></MemoryRouter>)
    
    fireEvent.click(screen.getByText(/Guardar/i))
    
    await waitFor(() => {
        expect(screen.getByText(/El nombre es requerido/i)).toBeInTheDocument()
    })
  })
})
