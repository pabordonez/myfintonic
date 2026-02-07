import { Outlet, Navigate } from 'react-router-dom'
import { Navbar } from './Navbar'
import { useAuth } from '@/hooks/useAuth'

export const MainLayout = () => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/auth/login" replace />

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
