// Logo SENTINELLE moderne - VERSION SIMPLIFIÉE
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SentinelleLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
};

const SentinelleLogo: React.FC<SentinelleLogoProps> = ({
  size = 'md',
  className,
  animated = true,
}) => {
  return (
    <motion.div
      className={cn(
        'relative flex items-center justify-center',
        sizeClasses[size],
        className
      )}
      initial={animated ? { scale: 0, rotate: -180 } : {}}
      animate={animated ? { scale: 1, rotate: 0 } : {}}
      transition={animated ? { duration: 0.8 } : {}}
      whileHover={animated ? { scale: 1.1, rotate: 5 } : {}}
      whileTap={animated ? { scale: 0.95 } : {}}
    >
      {/* Cercle principal */}
      <div className="w-full h-full bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
        {/* Lettre S stylisée */}
        <motion.div
          className="text-white font-bold"
          style={{ fontSize: '60%' }}
          initial={animated ? { opacity: 0, y: 10 } : {}}
          animate={animated ? { opacity: 1, y: 0 } : {}}
          transition={animated ? { duration: 0.5, delay: 0.3 } : {}}
        >
          S
        </motion.div>
        
        {/* Effet de brillance */}
        {animated && (
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          />
        )}
      </div>
      
      {/* Particules flottantes (optionnel) */}
      {animated && size !== 'xs' && size !== 'sm' && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-orange-400 rounded-full"
              style={{
                top: `${20 + i * 30}%`,
                left: `${10 + i * 20}%`,
              }}
              animate={{
                y: [-2, 2, -2],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
};

export { SentinelleLogo };