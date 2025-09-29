// Provider de toast global
'use client';

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from './Toast';
import { toastManager } from '@/lib/toast-utils';

interface ToastContextType {
  toasts: any[];
  addToast: (toast: any) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  success: (title: string, message: string, options?: any) => string;
  error: (title: string, message: string, options?: any) => string;
  warning: (title: string, message: string, options?: any) => string;
  info: (title: string, message: string, options?: any) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const toast = useToast();

  // Écouter les toasts du toast manager
  useEffect(() => {
    const unsubscribe = toastManager.subscribe((toastMessage) => {
      toast.addToast({
        type: toastMessage.type,
        title: toastMessage.title,
        message: toastMessage.message,
      });
    });
    return unsubscribe;
  }, [toast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}
