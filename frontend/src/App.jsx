import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppShell } from './components/AppShell';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { TransactionsPage } from './pages/Transactions';
import { UsersPage } from './pages/Users';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route element={<AdminRoute />}>
                <Route path="/users" element={<UsersPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
