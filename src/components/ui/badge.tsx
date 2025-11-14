'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

const variants = {
  default: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  success:
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  warning:
    'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  outline:
    'border border-border text-foreground dark:border-border/60 dark:text-foreground',
};

type Variant = keyof typeof variants;

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      variants[variant],
      className,
    )}
    {...props}
  />
);
