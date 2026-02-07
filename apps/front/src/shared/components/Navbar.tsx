import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LogOut, Settings } from 'lucide-react'

export const Navbar = () => {
  const { user, logout } = useAuth()

  if (!user) return null

  // Lógica de visualización: Nickname tiene prioridad sobre FirstName
  const displayName = user.nickname || user.firstName

  const tabs = [
    {
      name: user.role === 'ADMIN' ? 'Clientes' : 'Mis Entidades',
      path: '/dashboard',
    },
    {
      name: 'Productos',
      path: '/products',
    },
    {
      name: 'Entidades',
      path: '/financial-entities',
    },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link
            to="/dashboard"
            className="text-xl font-bold text-indigo-600 flex items-center gap-2"
          >
            <span className="hidden sm:inline">MyFintonic</span>
          </Link>

          {/* Navegación Principal */}
          <div className="flex space-x-4 sm:space-x-8">
            {tabs.map((tab) => (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`
                }
              >
                {tab.name}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Área de Usuario */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-2">
            <span className="text-sm font-semibold text-gray-800">
              {displayName}
            </span>
            <span className="text-xs text-gray-500 capitalize">
              {user.role.toLowerCase()}
            </span>
          </div>

          <div className="flex items-center gap-2 border-l pl-4 border-gray-200">
            {/* Botón Editar Perfil */}
            <Link
              to="/profile/edit"
              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
              title="Editar Perfil"
            >
              <Settings size={20} />
            </Link>

            {/* Botón Cerrar Sesión */}
            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
