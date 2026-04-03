import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../constants';

export function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function AdminRoute() {
  const { user } = useAuth();

  if (user?.role !== USER_ROLES.ADMIN) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
