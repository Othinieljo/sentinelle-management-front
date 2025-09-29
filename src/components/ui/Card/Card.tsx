// Card moderne et responsive
'use client';

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { CardVariant, BaseComponentProps } from '@/types/ui';
import { cn } from '@/lib/utils';

interface CardProps extends BaseComponentProps {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

const cardVariants = {
  default: 'bg-white border border-gray-200 shadow-sm',
  elevated: 'bg-white shadow-lg border border-gray-100',
  outlined: 'bg-white border-2 border-gray-300 shadow-none',
  glass: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg',
};

const paddingVariants = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      hover = false,
      clickable = false,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const Component = clickable ? motion.button : motion.div;
    const componentProps = clickable
      ? {
          onClick,
          type: 'button' as const,
          whileHover: hover ? { scale: 1.02, y: -2 } : {},
          whileTap: { scale: 0.98 },
        }
      : {
          whileHover: hover ? { scale: 1.01, y: -1 } : {},
        };

    return (
      <Component
        ref={ref}
        className={cn(
          // Base styles
          'rounded-xl transition-all duration-200',
          // Variant styles
          cardVariants[variant],
          // Padding
          paddingVariants[padding],
          // Interactive states
          clickable && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
          hover && 'hover:shadow-xl',
          className
        )}
        transition={{ duration: 0.2 }}
        {...(componentProps as any)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

// Sous-composants
const CardHeader = forwardRef<HTMLDivElement, BaseComponentProps>(
  ({ className, children, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 pb-4', className)}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, BaseComponentProps & { as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' }>(
  ({ className, as: Component = 'h3', children, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight text-gray-900', className)}
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      {...props}
    >
      <Component>{children}</Component>
    </motion.div>
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, BaseComponentProps>(
  ({ className, children, ...props }, ref) => (
    <motion.p
      ref={ref}
      className={cn('text-sm text-gray-600', className)}
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      {...props}
    >
      {children}
    </motion.p>
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, BaseComponentProps>(
  ({ className, children, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn('pt-0', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, BaseComponentProps>(
  ({ className, children, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn('flex items-center pt-4', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      {...props}
    >
      {children}
    </motion.div>
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };