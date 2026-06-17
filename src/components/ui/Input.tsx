'use client';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-text-secondary">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full rounded-xl border border-glass-border bg-glass-bg px-4 py-2.5 text-sm text-text-primary',
              'placeholder:text-text-muted backdrop-blur-sm',
              'focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20',
              'transition-all duration-200',
              icon && 'pl-10',
              error && 'border-danger/50 focus:border-danger focus:ring-danger/20',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
export { Input, type InputProps };
