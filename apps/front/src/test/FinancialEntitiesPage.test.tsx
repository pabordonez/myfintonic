import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FinancialEntitiesPage } from '../features/financial-entities/pages/FinancialEntitiesPage'
import axios from 'axios'
import { MemoryRouter } from 'react-router-dom'
import { API_URL } from '../config/api'

vi.mock('axios')
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockUseAuth = vi.fn()
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('FinancialEntitiesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders list of entities', async () => {
    mockUseAuth.mockReturnValue({ user: { role: 'USER' }, token: 'token' })
    const mockEntities = [
      { id: '1', name: 'Bank A', createdAt: new Date().toISOString() },
      { id: '2', name: 'Bank B', createdAt: new Date().toISOString() }
    ]
    vi.mocked(axios.get).mockResolvedValue({ data: mockEntities })

    render(
      <MemoryRouter>
        <FinancialEntitiesPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Catálogo de Entidades')).toBeInTheDocument()
      expect(screen.getByText('Bank A')).toBeInTheDocument()
      expect(screen.getByText('Bank B')).toBeInTheDocument()
    })
  })

  it('shows delete button only for ADMIN', async () => {
    mockUseAuth.mockReturnValue({ user: { role: 'ADMIN' }, token: 'token' })
    const mockEntities = [{ id: '1', name: 'Bank A', createdAt: new Date().toISOString() }]
    vi.mocked(axios.get).mockResolvedValue({ data: mockEntities })

    render(
      <MemoryRouter>
        <FinancialEntitiesPage />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Bank A')).toBeInTheDocument())
    
    expect(screen.getByTitle('Eliminar entidad')).toBeInTheDocument()
    expect(screen.getByText('Nueva Entidad')).toBeInTheDocument()
  })

  it('hides delete button for USER', async () => {
    mockUseAuth.mockReturnValue({ user: { role: 'USER' }, token: 'token' })
    const mockEntities = [{ id: '1', name: 'Bank A', createdAt: new Date().toISOString() }]
    vi.mocked(axios.get).mockResolvedValue({ data: mockEntities })

    render(
      <MemoryRouter>
        <FinancialEntitiesPage />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Bank A')).toBeInTheDocument())
    
    expect(screen.queryByTitle('Eliminar entidad')).not.toBeInTheDocument()
    expect(screen.queryByText('Nueva Entidad')).not.toBeInTheDocument()
  })

  it('deletes entity when confirmed', async () => {
    mockUseAuth.mockReturnValue({ user: { role: 'ADMIN' }, token: 'token' })
    const mockEntities = [{ id: '1', name: 'Bank A', createdAt: new Date().toISOString() }]
    vi.mocked(axios.get).mockResolvedValue({ data: mockEntities })
    vi.mocked(axios.delete).mockResolvedValue({})
    
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(
      <MemoryRouter>
        <FinancialEntitiesPage />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Bank A')).toBeInTheDocument())

    const deleteBtn = screen.getByTitle('Eliminar entidad')
    fireEvent.click(deleteBtn)

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(`${API_URL}/financial-entities/1`, expect.any(Object))
      expect(screen.queryByText('Bank A')).not.toBeInTheDocument()
    })
  })

  it('renders entity name as link for ADMIN and text for USER', async () => {
    const mockEntities = [{ id: '1', name: 'Bank Link', createdAt: new Date().toISOString() }]
    vi.mocked(axios.get).mockResolvedValue({ data: mockEntities })

    // 1. Check ADMIN
    mockUseAuth.mockReturnValue({ user: { role: 'ADMIN' }, token: 'token' })
    const { unmount } = render(
      <MemoryRouter>
        <FinancialEntitiesPage />
      </MemoryRouter>
    )
    await waitFor(() => expect(screen.getByText('Bank Link')).toBeInTheDocument())
    expect(screen.getByText('Bank Link').closest('a')).toHaveAttribute('href', '/financial-entities/1')
    unmount()

    // 2. Check USER
    mockUseAuth.mockReturnValue({ user: { role: 'USER' }, token: 'token' })
    render(
      <MemoryRouter>
        <FinancialEntitiesPage />
      </MemoryRouter>
    )
    await waitFor(() => expect(screen.getByText('Bank Link')).toBeInTheDocument())
    expect(screen.getByText('Bank Link').closest('a')).toBeNull()
  })

  it('displays error message on fetch failure', async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error('Fetch failed'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <FinancialEntitiesPage />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Error al cargar las entidades')).toBeInTheDocument())
    consoleSpy.mockRestore()
  })

  it('displays error message on delete failure', async () => {
    mockUseAuth.mockReturnValue({ user: { role: 'ADMIN' }, token: 'token' })
    const mockEntities = [{ id: '1', name: 'Bank A', createdAt: new Date().toISOString() }]
    vi.mocked(axios.get).mockResolvedValue({ data: mockEntities })
    vi.mocked(axios.delete).mockRejectedValue(new Error('Delete failed'))
    
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <FinancialEntitiesPage />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Bank A')).toBeInTheDocument())
    fireEvent.click(screen.getByTitle('Eliminar entidad'))

    await waitFor(() => expect(screen.getByText('Error al eliminar la entidad')).toBeInTheDocument())
    consoleSpy.mockRestore()
  })
})