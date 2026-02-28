import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login')

    if (error.response && error.response.status === 401 && !isLoginRequest) {
      localStorage.removeItem('user')

      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)
