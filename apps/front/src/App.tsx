// apps/front/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { MainLayout } from '@/shared/components/MainLayout'
import { ProductsPage } from '@/features/products/pages/ProductsPage'
import { FinancialEntitiesPage } from '@/features/financial-entities/pages/FinancialEntitiesPage'
import { ProductFormPage } from '@/features/products/pages/ProductFormPage'
import { FinancialEntityFormPage } from '@/features/financial-entities/pages/FinancialEntityFormPage'
import { ClientFinancialEntityFormPage } from '@/features/client-financial-entities/pages/ClientFinancialEntityFormPage'
import { EditProfilePage } from '@/features/profile/pages/EditProfilePage'
import { ChangePasswordPage } from './features/clients/pages/ChangePasswordPage'
import { TransactionListPage } from '@/features/products/pages/TransactionListPage'
import { TransactionFormPage } from '@/features/products/pages/TransactionFormPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products/:id" element={<ProductFormPage />} />
          <Route
            path="/products/:id/transactions"
            element={<TransactionListPage />}
          />
          <Route
            path="/products/:id/transactions/new"
            element={<TransactionFormPage />}
          />
          <Route
            path="/financial-entities"
            element={<FinancialEntitiesPage />}
          />
          <Route
            path="/financial-entities/new"
            element={<FinancialEntityFormPage />}
          />
          <Route
            path="/financial-entities/:id"
            element={<FinancialEntityFormPage />}
          />
          <Route
            path="/client-entities/new"
            element={<ClientFinancialEntityFormPage />}
          />
          <Route
            path="/client-entities/:id"
            element={<ClientFinancialEntityFormPage />}
          />

         <Route
            path="/clients/:id/change-password"
            element={<ChangePasswordPage />}
          />

          <Route path="/profile/edit" element={<EditProfilePage />} />
        </Route>

        <Route path="/" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
