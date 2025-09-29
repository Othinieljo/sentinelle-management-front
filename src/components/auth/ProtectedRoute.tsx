'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/auth';
import { motion } from 'framer-motion';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'member' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Éviter les redirections multiples
    if (hasRedirected) return;

    console.log('ProtectedRoute Debug:', {
      isLoading,
      isAuthenticated,
      user: user ? `${user.first_name} ${user.last_name}` : 'null',
      userRole: user?.role,
      requiredRole,
      hasRedirected
    });

    if (!isLoading && !isAuthenticated) {
      console.log('Redirecting to login: not authenticated');
      setHasRedirected(true);
      router.push('/login');
      return;
    }

    if (!isLoading && isAuthenticated && requiredRole && user?.role !== requiredRole) {
      console.log('Redirecting due to role mismatch:', user?.role, 'vs', requiredRole);
      setHasRedirected(true);
      // Rediriger vers la page appropriée selon le rôle
      router.push(user?.role === 'admin' ? '/admin' : '/member');
      return;
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router, hasRedirected]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-gray-600">Chargement...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
