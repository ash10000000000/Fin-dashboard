import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { TOAST_AUTO_DISMISS_MS } from '../constants';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (message, variant = 'info') => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, variant }]);
      window.setTimeout(() => dismiss(id), TOAST_AUTO_DISMISS_MS);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      toast: pushToast,
      dismiss,
      toasts,
    }),
    [pushToast, dismiss, toasts]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
