import React from 'react';
import { cn } from '../utils/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  className,
  id,
  required,
  ...props
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
          {label}
          {required && <span className="text-[var(--brand)] ml-1">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          'w-full min-h-[100px] sm:min-h-[120px] px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-1 focus:border-[var(--brand)]',
          'text-base sm:text-sm', // Larger text on mobile
          error
            ? 'border-red-400 focus:ring-red-400 focus:border-red-400 bg-red-50'
            : 'border-[var(--border)] hover:border-gray-300 bg-white',
          'disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500',
          'text-[var(--text)] placeholder:text-gray-400 resize-vertical',
          className
        )}
        required={required}
        {...props}
      />
      {error && <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-gray-500">{helperText}</p>}
    </div>
  );
};

