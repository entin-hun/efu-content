/**
 * Badge Component
 * 
 * Kis címkéző komponens státuszok, kategóriák jelzésére.
 */

'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

type BadgeVariant = 'default' | 'red' | 'gold' | 'green' | 'gray' | 'outline';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-brand-dark-muted text-gray-300',
  red: 'bg-brand-red/20 text-brand-red-light border border-brand-red/30',
  gold: 'bg-brand-gold/20 text-brand-gold border border-brand-gold/30',
  green: 'bg-green-500/20 text-green-400 border border-green-500/30',
  gray: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  outline: 'bg-transparent border border-brand-dark-border text-gray-400',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'sm', dot = false, className, children, ...props }, ref) => {
    const classes = twMerge(
      'inline-flex items-center gap-1.5 rounded-full font-medium',
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    return (
      <span ref={ref} className={classes} {...props}>
        {dot && (
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
