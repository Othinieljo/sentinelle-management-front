// Composant Modal moderne
'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ModalSize, BaseComponentProps } from '@/types/ui';
import { cn } from '@/lib/utils';

interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

const sizeClasses = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  children,
  className,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          {/* Modal */}
          <motion.div
            ref={modalRef}
            className={cn(
              'relative bg-white rounded-xl shadow-xl w-full max-h-[90vh] flex flex-col',
              sizeClasses[size],
              className
            )}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Sous-composants
const ModalHeader: React.FC<BaseComponentProps> = ({ className, children, ...props }) => (
  <motion.div
    className={cn('px-6 py-4 border-b border-gray-200', className)}
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2, delay: 0.1 }}
    {...props}
  >
    {children}
  </motion.div>
);

const ModalBody: React.FC<BaseComponentProps> = ({ className, children, ...props }) => (
  <motion.div
    className={cn('px-6 py-4 flex-1 overflow-y-auto', className)}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2, delay: 0.2 }}
    {...props}
  >
    {children}
  </motion.div>
);

const ModalFooter: React.FC<BaseComponentProps> = ({ className, children, ...props }) => (
  <motion.div
    className={cn('px-6 py-4 border-t border-gray-200 flex justify-end space-x-3', className)}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2, delay: 0.3 }}
    {...props}
  >
    {children}
  </motion.div>
);

export { Modal, ModalHeader, ModalBody, ModalFooter };