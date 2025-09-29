'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, User, Shield } from 'lucide-react';
import { Button } from '../ui';

const DemoBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Info size={24} />
            <div>
              <h3 className="font-bold">Mode Démonstration</h3>
              <p className="text-sm opacity-90">
                Utilisez ces identifiants pour tester l&apos;application :
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <User size={16} />
              <span>Membre: +33 6 12 34 56 78 / password</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Shield size={16} />
              <span>Admin: +33 6 98 76 54 32 / admin</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DemoBanner;
