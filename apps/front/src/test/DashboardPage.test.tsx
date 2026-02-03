import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DashboardPage } from '../features/dashboard/pages/DashboardPage'
import axios from 'axios'
import { MemoryRouter } from 'react-router-dom'
import { API_URL } from '../config/api'

vi.mock('axios')
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders loading state initially', () => {
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('user', JSON.stringify({ id: '123', role: 'USER' }))

    // Mock promise that doesn't resolve immediately
    vi.mocked(axios.get).mockImplementation(() => new Promise(() => {}))

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )
    expect(screen.getByText(/Cargando.../i)).toBeInTheDocument()
  })

  it('renders USER data correctly', async () => {
    localStorage.setItem('token', 'test-token')
    localStorage.setItem(
      'user',
      JSON.stringify({ id: 'user-123', role: 'USER' })
    )

    const mockData = [
      {
        id: '1',
        financialEntity: { name: 'Banco Santander' },
        balance: 1500.5,
        updatedAt: '2023-10-01T10:00:00Z',
      },
    ]

    vi.mocked(axios.get).mockResolvedValue({ data: mockData })

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Banco Santander')).toBeInTheDocument()
      // Check for currency formatting (partial match due to potential locale differences)
      expect(screen.getAllByText(/1\.?500,50\s*€/)[0]).toBeInTheDocument()
    })

    expect(axios.get).toHaveBeenCalledWith(
      `${API_URL}/clients/user-123/financial-entities`,
      expect.any(Object)
    )
  })

  it('renders ADMIN data correctly', async () => {
    localStorage.setItem('token', 'test-token')
    localStorage.setItem(
      'user',
      JSON.stringify({ id: 'admin-1', role: 'ADMIN' })
    )

    const mockData = [
      {
        id: 'client-1',
        firstName: 'Juan',
        lastName: 'Perez',
        email: 'juan@test.com',
        role: 'USER',
      },
    ]

    vi.mocked(axios.get).mockResolvedValue({ data: mockData })

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Juan Perez (juan@test.com)')).toBeInTheDocument()
    })

    expect(axios.get).toHaveBeenCalledWith(
      `${API_URL}/clients`,
      expect.any(Object)
    )
  })

  it('handles API errors', async () => {
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('user', JSON.stringify({ id: '123', role: 'USER' }))

    vi.mocked(axios.get).mockRejectedValue(new Error('Network Error'))

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Error al cargar los datos')).toBeInTheDocument()
    })
  })

  it('shows link entity button for USER', async () => {
    localStorage.setItem('token', 'test-token')
    localStorage.setItem(
      'user',
      JSON.stringify({ id: 'user-123', role: 'USER' })
    )
    vi.mocked(axios.get).mockResolvedValue({ data: [] })

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )
    await waitFor(() =>
      expect(screen.getByText('Nueva Entidad')).toBeInTheDocument()
    )
  })

  it('navigates to edit client entity when clicking name', async () => {
    localStorage.setItem('token', 'test-token')
    localStorage.setItem(
      'user',
      JSON.stringify({ id: 'user-123', role: 'USER' })
    )
    const mockData = [
      { id: 'assoc-1', financialEntity: { name: 'Santander' }, balance: 1000 },
    ]
    vi.mocked(axios.get).mockResolvedValue({ data: mockData })

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )
    await waitFor(() => {
      const link = screen.getByText('Santander')
      expect(link.closest('a')).toHaveAttribute(
        'href',
        '/client-entities/assoc-1'
      )
    })
  })

  it('allows USER to delete an entity', async () => {
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('user', JSON.stringify({ id: 'user-123', role: 'USER' }))

    const mockData = [
      { id: 'assoc-1', financialEntity: { name: 'Santander' }, balance: 1000 },
    ]
    vi.mocked(axios.get).mockResolvedValue({ data: mockData })
    vi.mocked(axios.delete).mockResolvedValue({})
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true)

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Santander')).toBeInTheDocument()
    })

    const deleteBtn = screen.getByTitle('Eliminar entidad')
    fireEvent.click(deleteBtn)

    expect(confirmSpy).toHaveBeenCalled()
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        `${API_URL}/clients/user-123/financial-entities/assoc-1`,
        expect.any(Object)
      )
      // Should be removed from list
      expect(screen.queryByText('Santander')).not.toBeInTheDocument()
    })
    confirmSpy.mockRestore()
  })

  it('displays profitability badges for rows and global total', async () => {
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('user', JSON.stringify({ id: 'user-123', role: 'USER' }))

    const mockData = [
      { id: '1', financialEntity: { name: 'Bank A' }, balance: 1100, initialBalance: 1000 }, // +10%
      { id: '2', financialEntity: { name: 'Bank B' }, balance: 2400, initialBalance: 2000 }, // +20%
    ]
    // Total Balance: 3500, Total Initial: 3000 -> +16.67%

    vi.mocked(axios.get).mockResolvedValue({ data: mockData })

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      // Row 1 Badge
      expect(screen.getByText('10.00%')).toBeInTheDocument()
      // Row 2 Badge
      expect(screen.getByText('20.00%')).toBeInTheDocument()
      // Global Badge
      expect(screen.getByText('16.67%')).toBeInTheDocument()
    })
  })
})
