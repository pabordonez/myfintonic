import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LogoutButton } from '../features/auth/components/LogoutButton'
import { authService } from '../features/auth/services/auth.service'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../features/auth/services/auth.service')
const mockNavigate = vi.fn()
const mockRefreshUser = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ refreshUser: mockRefreshUser }),
}))

describe('LogoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls logout service and redirects', async () => {
    vi.mocked(authService.logout).mockResolvedValue({})

    render(
      <MemoryRouter>
        <LogoutButton />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(authService.logout).toHaveBeenCalled()
      expect(mockRefreshUser).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/auth/login')
    })
  })

  it('handles logout error gracefully', async () => {
    vi.mocked(authService.logout).mockRejectedValue(new Error('Logout failed'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <LogoutButton />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/auth/login')
    )
    consoleSpy.mockRestore()
  })
})
