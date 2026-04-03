import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loginRequest, logoutRequest, meRequest } from '../api/auth';
import { FullPageSpinner } from '../components/FullPageSpinner';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await meRequest();
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (credentials) => {
    const res = await loginRequest(credentials);
    setUser(res.data.user);
    return res;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      loading,
      login,
      logout,
      refreshUser,
    }),
    [user, loading, login, logout, refreshUser]
  );

  if (loading) {
    return <FullPageSpinner message="Verifying session…" />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
