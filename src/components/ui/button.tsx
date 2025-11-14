'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

const variants = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed',
  secondary:
    'bg-muted text-foreground hover:bg-muted/80 disabled:opacity-60 disabled:cursor-not-allowed',
  outline:
    'border border-border text-foreground hover:bg-muted/60 disabled:opacity-60 disabled:cursor-not-allowed',
  ghost: 'hover:bg-muted/50 disabled:opacity-60 disabled:cursor-not-allowed',
  danger:
    'bg-red-600 text-white hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed',
};

type Variant = keyof typeof variants;

const sizes = {
  sm: 'h-8 rounded-md px-3 text-xs',
  md: 'h-10 rounded-md px-4 text-sm',
  lg: 'h-12 rounded-md px-5 text-base',
};

type Size = keyof typeof sizes;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-colors',
          sizes[size],
          variants[variant],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
