/**
 * Section Component
 * 
 * Szekció konténer komponens konzisztens padding-gal és háttérrel.
 */

'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

type SectionVariant = 'default' | 'dark' | 'gradient' | 'glass';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  variant?: SectionVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  narrow?: boolean;
}

const variantClasses: Record<SectionVariant, string> = {
  default: 'bg-brand-dark text-white',
  dark: 'bg-black text-white',
  gradient: 'gradient-red text-white',
  glass: 'glass text-white',
};

const paddingClasses: Record<string, string> = {
  none: 'py-0',
  sm: 'py-8',
  md: 'py-16',
  lg: 'py-24',
  xl: 'py-32',
};

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ variant = 'default', padding = 'lg', narrow = false, className, children, ...props }, ref) => {
    const classes = twMerge(
      'w-full',
      variantClasses[variant],
      paddingClasses[padding],
      className
    );

    return (
      <section ref={ref} className={classes} {...props}>
        <div className={narrow ? 'container-narrow' : 'container-wide'}>
          {children}
        </div>
      </section>
    );
  }
);

Section.displayName = 'Section';
