'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Settings, LogOut, User } from 'lucide-react';
import { Card, CardContent } from '../ui';
import { useAuthStore } from '../../stores/auth';
import { UserService, UserRoleCounts } from '../../lib/services/userService';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  className?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ className }) => {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [userStats, setUserStats] = useState<UserRoleCounts | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Charger les statistiques des utilisateurs
  const loadUserStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const stats = await UserService.getUserRoleCounts();
      setUserStats(stats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Charger les données au montage
  useEffect(() => {
    loadUserStats();
  }, [loadUserStats]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
  };

  const handleGoToMemberArea = () => {
    router.push('/member');
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <Card variant="elevated" className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12" />
        </div>

        <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
            {/* Admin info */}
            <div className="flex items-center space-x-4">
              <motion.div
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Shield size={32} className="text-orange-500" />
              </motion.div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Administration SENTINELLE
                </h1>
                <p className="text-gray-600">
                  Bienvenue, {user.first_name} {user.last_name} - Panel d&apos;administration
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex space-x-6">
              <motion.div
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center space-x-2 text-gray-600 mb-1">
                  <Users size={20} />
                  <span className="text-sm font-medium">Membres</span>
                </div>
                {loadingStats ? (
                  <div className="text-xl font-bold text-gray-400">...</div>
                ) : (
                  <div className="text-2xl font-bold text-blue-600">
                    {userStats?.total?.toLocaleString() || '0'}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={handleGoToMemberArea}
                className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-xl transition-all duration-200 border border-white border-opacity-30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Accéder à mon espace membre"
              >
                <User size={20} />
                <span className="text-sm font-medium">Espace Membre</span>
              </motion.button>
              <motion.button
                className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings size={24} />
              </motion.button>
              <motion.button
                onClick={handleLogout}
                className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut size={24} />
              </motion.button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminHeader;
