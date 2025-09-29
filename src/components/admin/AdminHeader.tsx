'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, TrendingUp, Settings, LogOut } from 'lucide-react';
import { Card, CardContent } from '../ui';
import { useAuthStore } from '../../stores/auth';

interface AdminHeaderProps {
  className?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ className }) => {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const handleLogout = () => {
    logout();
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
                <div className="text-2xl font-bold text-blue-600">1,247</div>
              </motion.div>

              <motion.div
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center space-x-2 text-gray-600 mb-1">
                  <TrendingUp size={20} />
                  <span className="text-sm font-medium">Revenus</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  2.5M FCFA
                </div>
              </motion.div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
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
