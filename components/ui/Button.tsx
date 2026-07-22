/**
 * Button Component
 * 
 * Újrafelhasználható gomb komponens különböző variánsokkal.
 */

'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'outline-gold';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand-red hover:bg-brand-red-dark text-white font-bold active:scale-95',
  secondary: 'bg-brand-gold hover:bg-brand-gold-dark text-black font-bold active:scale-95',
  ghost: 'bg-transparent hover:bg-white/10 text-white font-semibold',
  outline: 'bg-transparent border-2 border-brand-red text-brand-red hover:bg-brand-red hover:text-white font-bold active:scale-95',
  'outline-gold': 'bg-transparent border-2 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-black font-bold active:scale-95',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'py-2 px-4 text-sm',
  md: 'py-4 px-8 text-base',
  lg: 'py-5 px-10 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, fullWidth = false, className, children, disabled, ...props }, ref) => {
    const classes = twMerge(
      'inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 focus:ring-offset-brand-dark disabled:opacity-50 disabled:cursor-not-allowed',
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && 'w-full',
      className
    );

    return (
      <button ref={ref} className={classes} disabled={disabled || loading} {...props}>
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
