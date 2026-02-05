import React from 'react';
import { cn } from '../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-95';
  
  const variants = {
    primary: 'bg-[var(--brand)] text-white hover:bg-[#E06A0F] focus:ring-[var(--brand)] shadow-sm hover:shadow-md',
    secondary: 'bg-white border border-[var(--border)] text-gray-700 hover:bg-gray-50 focus:ring-gray-400 shadow-sm',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400',
    outline: 'border-2 border-[var(--border)] bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-400',
  };

  const sizes = {
    sm: 'px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm min-h-[36px] sm:min-h-[32px]',
    md: 'px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm min-h-[40px] sm:min-h-[38px]',
    lg: 'px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base min-h-[44px] sm:min-h-[44px]',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

