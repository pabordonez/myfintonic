import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../hooks/useAuth'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import axios from 'axios'

const { mockNavigate } = vi.hoisted(() => {
  return { mockNavigate: vi.fn() }
})

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

// Mock axios with a factory to handle instances created via axios.create()
vi.mock('axios', () => {
  const mockAxios = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    create: vi.fn().mockReturnThis(),
    defaults: { headers: { common: {} } },
    isAxiosError: vi.fn(),
  }
  return { default: mockAxios }
})

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    global.fetch = vi.fn()
  })

  it('should initialize with user from localStorage', () => {
    const user = { id: '1', name: 'Test' }
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', 'token')

    const { result } = renderHook(() => useAuth())

    expect(result.current.user).toEqual(user)
    expect(result.current.token).toBe('token')
  })

  it('refreshUser should update user state on success', async () => {
    const user = { id: '1' }
    localStorage.setItem('token', 'token')
    localStorage.setItem('user', JSON.stringify({ id: '1' }))

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => user,
    })
    global.fetch = mockFetch

    // Mock axios as well in case useAuth uses it
    vi.mocked(axios.get).mockResolvedValue({ data: user })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.refreshUser()
    })

    expect(result.current.user).toEqual(user)
    expect(localStorage.getItem('user')).toBe(JSON.stringify(user))
  })

  it('refreshUser should handle error gracefully', async () => {
    localStorage.setItem('token', 'token')
    localStorage.setItem('user', JSON.stringify({ id: '1' }))

    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
    vi.mocked(axios.get).mockRejectedValue(new Error('Network error'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.refreshUser()
    })

    consoleSpy.mockRestore()
  })
})
