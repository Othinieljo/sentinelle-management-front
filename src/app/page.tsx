// Page d'accueil moderne - VERSION SIMPLIFIÉE
'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth/auth-store';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner/LoadingSpinner';
import { SentinelleLogo } from '@/components/common/SentinelleLogo';

export default function HomePage() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Éviter les redirections multiples
    if (hasRedirected.current || isLoading) return;

    const timer = setTimeout(() => {
      if (hasRedirected.current) return; // Double vérification
      
      hasRedirected.current = true;
      
      if (isAuthenticated && user) {
        // Rediriger vers le dashboard approprié selon le rôle
        const dashboardPath = user.role === 'admin' ? '/admin' : '/member';
        router.replace(dashboardPath);
      } else {
        // Rediriger vers la page de connexion
        router.replace('/login');
      }
    }, 1000); // Délai plus long pour laisser le temps à l'initialisation

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
      <div className="text-center">
        <SentinelleLogo size="lg" className="mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Bienvenue sur SENTINELLE
        </h1>
        <p className="text-gray-600 mb-8">
          Chargement...
        </p>
        <LoadingSpinner />
      </div>
    </div>
  );
}