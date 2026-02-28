import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../hooks/useAuth'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

// Mock de useNavigate
const { mockNavigate } = vi.hoisted(() => {
  return { mockNavigate: vi.fn() }
})

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should initialize with user from localStorage', () => {
    const user = {
      id: '1',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      role: 'USER',
    }
    localStorage.setItem('user', JSON.stringify(user))

    const { result } = renderHook(() => useAuth(), {
      wrapper: MemoryRouter,
    })

    expect(result.current.user).toEqual(user)
    // Eliminamos la aserción del token ya que ya no se expone
  })

  it('should initialize with null if no user in localStorage', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: MemoryRouter,
    })

    expect(result.current.user).toBeNull()
  })

  it('should logout correctly', () => {
    const user = {
      id: '1',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      role: 'USER',
    }
    localStorage.setItem('user', JSON.stringify(user))

    const { result } = renderHook(() => useAuth(), {
      wrapper: MemoryRouter,
    })

    act(() => {
      result.current.logout()
    })

    expect(localStorage.getItem('user')).toBeNull()
    expect(result.current.user).toBeNull()
    expect(mockNavigate).toHaveBeenCalledWith('/auth/login')
  })

  it('should refresh user from localStorage', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: MemoryRouter,
    })

    const newUser = {
      id: '2',
      firstName: 'New',
      lastName: 'User',
      email: 'new@test.com',
      role: 'USER',
    }
    localStorage.setItem('user', JSON.stringify(newUser))

    await act(async () => {
      await result.current.refreshUser()
    })

    expect(result.current.user).toEqual(newUser)
  })
})
