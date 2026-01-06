import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'hero' | 'heroOutline' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', asChild = false, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    const variants = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary',
      hero: 'bg-gradient-to-r from-primary to-emerald-500 text-white hover:from-primary/90 hover:to-emerald-500/90 shadow-lg hover:shadow-xl focus:ring-primary',
      heroOutline: 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground focus:ring-primary',
      outline: 'border border-border text-foreground hover:bg-muted focus:ring-primary',
      ghost: 'text-foreground hover:bg-muted focus:ring-primary'
    };
    
    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-8 py-3 text-lg'
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        className: cn(baseClasses, variants[variant], sizes[size], className),
        ref,
        ...props
      });
    }

    return (
      <button
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';