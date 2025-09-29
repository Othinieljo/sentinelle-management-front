// Input moderne et responsive - VERSION SIMPLIFIÉE
'use client';

import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { InputVariant } from '@/types/ui';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  label?: string;
  error?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  fullWidth?: boolean;
  loading?: boolean;
}

const inputVariants = {
  default: 'border-gray-300 focus:border-orange-500 focus:ring-orange-500',
  filled: 'bg-gray-100 border-gray-300 focus:bg-white focus:border-orange-500 focus:ring-orange-500',
  outline: 'border-2 border-gray-300 focus:border-orange-500 focus:ring-orange-500',
  ghost: 'border-transparent bg-transparent focus:bg-gray-50 focus:border-gray-300',
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = 'default',
      label,
      error,
      success = false,
      leftIcon,
      rightIcon,
      helperText,
      fullWidth = false,
      loading = false,
      type = 'text',
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;
    const hasError = !!error;
    const hasSuccess = success && !hasError;

    const handleTogglePassword = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {label && (
          <motion.label
            className={cn(
              'block text-sm font-medium text-gray-700 mb-1',
              hasError && 'text-red-600',
              hasSuccess && 'text-green-600'
            )}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            disabled={disabled || loading}
            className={cn(
              // Base styles
              'block w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed',
              // Variant styles
              inputVariants[variant],
              // Icon padding
              leftIcon && 'pl-10',
              (rightIcon || isPassword || hasError || hasSuccess || loading) && 'pr-10',
              // States
              hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              hasSuccess && 'border-green-500 focus:border-green-500 focus:ring-green-500',
              isFocused && !hasError && !hasSuccess && 'border-orange-500 focus:ring-orange-500',
              // Full width
              fullWidth && 'w-full',
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {loading && (
              <motion.div
                className="w-4 h-4 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}

            {!loading && isPassword && (
              <motion.button
                type="button"
                onClick={handleTogglePassword}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </motion.button>
            )}

            {!loading && !isPassword && rightIcon && (
              <div className="text-gray-400">
                {rightIcon}
              </div>
            )}

            {!loading && !isPassword && !rightIcon && hasError && (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}

            {!loading && !isPassword && !rightIcon && hasSuccess && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
          </div>
        </div>

        {(helperText || error) && (
          <motion.div
            className={cn(
              'mt-1 text-sm',
              hasError && 'text-red-600',
              hasSuccess && 'text-green-600',
              !hasError && !hasSuccess && 'text-gray-500'
            )}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error || helperText}
          </motion.div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };