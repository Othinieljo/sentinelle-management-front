// Hook de toast moderne
import { useState, useCallback } from 'react';
import { ToastProps } from '@/types/ui';

interface Toast extends ToastProps {
  id: string;
  timestamp: number;
}

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = `toast-${++toastId}`;
    const newToast: Toast = {
      ...toast,
      id,
      timestamp: Date.now(),
      duration: toast.duration || 5000,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback((title: string, message: string, options?: Partial<ToastProps>) => {
    return addToast({ type: 'success', title, message, ...options });
  }, [addToast]);

  const error = useCallback((title: string, message: string, options?: Partial<ToastProps>) => {
    return addToast({ type: 'error', title, message, ...options });
  }, [addToast]);

  const warning = useCallback((title: string, message: string, options?: Partial<ToastProps>) => {
    return addToast({ type: 'warning', title, message, ...options });
  }, [addToast]);

  const info = useCallback((title: string, message: string, options?: Partial<ToastProps>) => {
    return addToast({ type: 'info', title, message, ...options });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  };
}

// Export pour compatibilité
export const toast = {
  success: (title: string, message: string) => ({ type: 'success' as const, title, message }),
  error: (title: string, message: string) => ({ type: 'error' as const, title, message }),
  warning: (title: string, message: string) => ({ type: 'warning' as const, title, message }),
  info: (title: string, message: string) => ({ type: 'info' as const, title, message }),
};
