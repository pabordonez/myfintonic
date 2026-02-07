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

const mockUseAuth = vi.fn()
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('FinancialEntityFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseParams.mockReturnValue({})
    mockUseAuth.mockReturnValue({
      token: 'test-token',
      user: { role: 'ADMIN' },
    })
  })

  it('renders create form', () => {
    render(
      <MemoryRouter>
        <FinancialEntityFormPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Nueva Entidad Financiera')).toBeInTheDocument()
    expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument()
  })

  it('redirects if not admin', () => {
    mockUseAuth.mockReturnValue({ token: 'test-token', user: { role: 'USER' } })
    render(
      <MemoryRouter>
        <FinancialEntityFormPage />
      </MemoryRouter>
    )
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })

  it('submits new entity successfully and resets form', async () => {
    vi.mocked(axios.post).mockResolvedValue({
      data: { id: 'new-ent', name: 'New Bank' },
    })

    render(
      <MemoryRouter>
        <FinancialEntityFormPage />
      </MemoryRouter>
    )

    const input = screen.getByLabelText(/Nombre/i)
    fireEvent.change(input, { target: { value: 'New Bank' } })
    fireEvent.click(screen.getByText(/Guardar/i))

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/financial-entities`,
        { name: 'New Bank' },
        expect.any(Object)
      )
      expect(
        screen.getByText('Entidad creada correctamente')
      ).toBeInTheDocument()
      // Verifica que el formulario se ha reseteado (input vacío)
      expect(input).toHaveValue('')
    })
  })

  it('displays error on submission failure', async () => {
    vi.mocked(axios.post).mockRejectedValue(new Error('Network error'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <FinancialEntityFormPage />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: 'New Bank' },
    })
    fireEvent.click(screen.getByText(/Guardar/i))

    await waitFor(() => {
      expect(screen.getByText('Error al crear la entidad')).toBeInTheDocument()
    })
    consoleSpy.mockRestore()
  })

  it('loads data and updates entity in edit mode', async () => {
    mockUseParams.mockReturnValue({ id: '123' })
    vi.mocked(axios.get).mockResolvedValue({
      data: { id: '123', name: 'Existing Bank' },
    })
    vi.mocked(axios.put).mockResolvedValue({
      data: { id: '123', name: 'Updated Bank' },
    })

    render(
      <MemoryRouter>
        <FinancialEntityFormPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Editar Entidad Financiera')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Existing Bank')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: 'Updated Bank' },
    })
    fireEvent.click(screen.getByText(/Guardar/i))

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        `${API_URL}/financial-entities/123`,
        { name: 'Updated Bank' },
        expect.any(Object)
      )
      expect(
        screen.getByText('Entidad actualizada correctamente')
      ).toBeInTheDocument()
    })
  })

  it('displays error message on load failure', async () => {
    mockUseParams.mockReturnValue({ id: '123' })
    vi.mocked(axios.get).mockRejectedValue(new Error('Load failed'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <FinancialEntityFormPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByText('Error al cargar la entidad')).toBeInTheDocument()
    )
    consoleSpy.mockRestore()
  })

  it('navigates back when "Volver" is clicked', () => {
    render(
      <MemoryRouter>
        <FinancialEntityFormPage />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByText('Volver'))
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })
})
