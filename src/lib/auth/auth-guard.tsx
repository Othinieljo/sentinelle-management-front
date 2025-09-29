// Guard d'authentification moderne
'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from './auth-store';
import { AuthGuardProps } from '@/types/auth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { motion } from 'framer-motion';

// Composant de chargement moderne
const AuthLoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
    <motion.div
      className="text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-16 h-16 mx-auto mb-6"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <div className="w-full h-full border-4 border-orange-200 border-t-orange-500 rounded-full" />
      </motion.div>
      <motion.h2
        className="text-xl font-semibold text-gray-800 mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        SENTINELLE
      </motion.h2>
      <motion.p
        className="text-gray-600"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Vérification de l'authentification...
      </motion.p>
    </motion.div>
  </div>
);

// Écran d'erreur d'authentification
const AuthErrorScreen = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center p-4">
    <motion.div
      className="text-center max-w-md"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Erreur d'authentification</h2>
      <p className="text-gray-600 mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        Réessayer
      </button>
    </motion.div>
  </div>
);

// Guard principal
export function AuthGuard({ 
  children, 
  roles = [], 
  requireAuth = true, 
  fallback 
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, user, initialize } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const verifyAuth = async () => {
      if (!requireAuth) {
        setIsChecking(false);
        return;
      }

      try {
        await initialize();
      } catch (error) {
        console.error('Auth verification failed:', error);
      } finally {
        setIsChecking(false);
      }
    };

    verifyAuth();
  }, [requireAuth, initialize]);

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    setIsChecking(true);
    try {
      await initialize();
    } finally {
      setIsChecking(false);
    }
  };

  // Afficher le chargement
  if (isLoading || isChecking) {
    return <AuthLoadingScreen />;
  }

  // Pas d'affichage d'erreur pour simplifier

  // Vérifier l'authentification requise
  if (requireAuth && !isAuthenticated) {
    return fallback || <AuthLoadingScreen />;
  }

  // Vérifier les rôles
  if (roles.length > 0 && user && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-16 h-16 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Accès non autorisé</h2>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retour
          </button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}

// Export par défaut
export default AuthGuard;
