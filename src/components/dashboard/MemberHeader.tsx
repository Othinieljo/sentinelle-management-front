'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, Wallet, RotateCcw, LogOut } from 'lucide-react';
import { Card, CardContent } from '../ui';
import { useAuthStore } from '../../stores/auth';

interface MemberHeaderProps {
  className?: string;
}

const MemberHeader: React.FC<MemberHeaderProps> = ({ className }) => {
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
            {/* User info */}
            <div className="flex items-center space-x-4">
              <motion.div
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <User size={32} className="text-orange-500" />
              </motion.div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Bonjour, {user.first_name} {user.last_name} !
                </h1>
                <p className="text-gray-600">
                  Membre de la communauté SENTINELLE
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex space-x-6">
              {/* Balance */}
              <motion.div
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center space-x-2 text-gray-600 mb-1">
                  <Wallet size={20} />
                  <span className="text-sm font-medium">Solde</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {user.balance.toLocaleString()} FCFA
                </div>
              </motion.div>

              {/* Spins */}
              <motion.div
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center space-x-2 text-gray-600 mb-1">
                  <RotateCcw size={20} />
                  <span className="text-sm font-medium">Tours</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  N/A
                </div>
              </motion.div>
            </div>

            {/* Logout button */}
            <motion.button
              onClick={handleLogout}
              className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut size={24} />
            </motion.button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MemberHeader;
