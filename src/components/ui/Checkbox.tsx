import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../utils/cn';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
  labelClassName?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled,
  error,
  className,
  labelClassName,
}) => {
  const checkboxId = `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cn('flex items-start', className)}>
      <label
        htmlFor={checkboxId}
        className={cn(
          'flex items-start cursor-pointer group',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            type="checkbox"
            id={checkboxId}
            checked={checked}
            onChange={(e) => !disabled && onChange(e.target.checked)}
            disabled={disabled}
            className="sr-only"
          />
          <div
            className={cn(
              'flex items-center justify-center w-6 h-6 rounded-md border-2 transition-all duration-200 touch-manipulation shrink-0',
              checked
                ? 'bg-[var(--brand)] border-[var(--brand)] shadow-sm'
                : 'bg-white border-gray-500 group-hover:border-gray-600 active:border-gray-700',
              disabled && 'group-hover:border-gray-500'
            )}
          >
            {checked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
          </div>
        </div>
        <span className={cn('ml-2 sm:ml-3 text-xs sm:text-sm text-gray-700 leading-5 sm:leading-6', labelClassName)}>{label}</span>
      </label>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

