import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FinancialEntitiesPage } from '../features/entities/pages/FinancialEntitiesPage'
import axios from 'axios'
import { MemoryRouter } from 'react-router-dom'

vi.mock('axios')

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ token: 'test-token' }),
}))

describe('FinancialEntitiesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the search input box', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: [] })
    render(
      <MemoryRouter>
        <FinancialEntitiesPage />
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar entidad...')).toBeInTheDocument()
    })
  })

  it('renders entities list correctly', async () => {
    const mockEntities = [
      { id: 'ent-1', name: 'BBVA' },
      { id: 'ent-2', name: 'CaixaBank' },
    ]

    vi.mocked(axios.get).mockResolvedValue({ data: mockEntities })

    render(
      <MemoryRouter>
        <FinancialEntitiesPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('BBVA')).toBeInTheDocument()
      expect(screen.getByText('CaixaBank')).toBeInTheDocument()
    })
  })

  it('displays empty state message', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: [] })

    render(
      <MemoryRouter>
        <FinancialEntitiesPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(
        screen.getByText('No hay entidades disponibles.'),
      ).toBeInTheDocument()
    })
  })
})
