/**
 * Card Component
 * 
 * Újrafelhasználható kártya komponens különböző stílusokkal.
 */

'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

type CardVariant = 'dark' | 'elevated' | 'flat' | 'bordered' | 'glass';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantClasses: Record<CardVariant, string> = {
  dark: 'bg-brand-dark-card border border-brand-dark-border rounded-2xl',
  elevated: 'bg-brand-dark-card border border-brand-dark-border rounded-2xl shadow-xl shadow-black/50',
  flat: 'bg-brand-dark-muted rounded-xl',
  bordered: 'bg-brand-dark-card border-2 border-brand-dark-border rounded-2xl',
  glass: 'bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl',
};

const paddingClasses: Record<string, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'dark', hover = false, padding = 'md', className, children, ...props }, ref) => {
    const classes = twMerge(
      variantClasses[variant],
      paddingClasses[padding],
      hover && 'transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-red/20',
      className
    );

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
