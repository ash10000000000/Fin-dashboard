import { useAuth } from '../context/AuthContext';

export function RoleGate({ roles, children }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) {
    return null;
  }
  return children;
}
