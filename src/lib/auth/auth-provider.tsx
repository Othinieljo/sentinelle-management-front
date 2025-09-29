'use client';

import React, { useEffect, useRef } from 'react';
import { useAuthStore } from './auth-store';
import { LoadingSpinner } from '@/components/ui';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authStore = useAuthStore();
  const { initialize, isLoading } = authStore;
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      initialize();
    }
  }, []); // Pas de dépendances pour éviter les boucles

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
};

export default AuthProvider;