'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, LogOut, Shield } from 'lucide-react';
import { Button } from '../ui';
import { useAuthStore } from '../../stores/auth';
import { SentinelleLogo } from './SentinelleLogo';

const Navigation: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navigationItems = [
    {
      id: 'member',
      label: 'Membre',
      icon: Home,
      path: '/member',
      roles: ['member'],
    },
    {
      id: 'admin',
      label: 'Administration',
      icon: Shield,
      path: '/admin',
      roles: ['admin'],
    },
  ];

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <motion.nav
      className="bg-white shadow-lg border-b border-gray-200"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={() => router.push(isAdmin ? '/admin' : '/member')}
              className="flex items-center space-x-3"
            >
              <SentinelleLogo size="md" />
            </button>
          </motion.div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-1">
            {filteredItems.map((item) => {
              const isActive = pathname.startsWith(item.path);
              return (
                <motion.div key={item.id}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={isActive ? 'gradient' : 'ghost'}
                      size="md"
                      leftIcon={<item.icon size={20} />}
                      onClick={() => router.push(item.path)}
                      className={`px-4 py-2 ${
                        isActive ? 'shadow-md' : ''
                      }`}
                    >
                      {item.label}
                    </Button>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-xs text-gray-500">
                  {isAdmin ? 'Administrateur' : 'Membre'}
                </div>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-orange-600">
                  {user.first_name.charAt(0)}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<LogOut size={16} />}
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-500"
              >
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;
