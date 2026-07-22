/**
 * Skeleton Component
 * 
 * Betöltés állapot jelző komponens (shimmer effect).
 */

'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

type SkeletonVariant = 'text' | 'title' | 'image' | 'circle' | 'rounded';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string;
  height?: string;
  lines?: number;
}

const variantClasses: Record<SkeletonVariant, string> = {
  text: 'h-4 rounded',
  title: 'h-8 rounded mb-4',
  image: 'aspect-video w-full rounded-lg',
  circle: 'rounded-full',
  rounded: 'rounded-xl',
};

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = 'text', width, height, lines = 1, className, ...props }, ref) => {
    const classes = twMerge(
      'bg-brand-dark-muted animate-pulse',
      variantClasses[variant],
      className
    );

    const style: React.CSSProperties = {
      width,
      height,
    };

    if (variant === 'text' && lines > 1) {
      return (
        <div ref={ref} className="space-y-3" {...props}>
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={classes}
              style={{
                ...style,
                width: i === lines - 1 ? '75%' : width || '100%',
              }}
            />
          ))}
        </div>
      );
    }

    return <div ref={ref} className={classes} style={style} {...props} />;
  }
);

Skeleton.displayName = 'Skeleton';
