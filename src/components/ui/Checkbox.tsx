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
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled,
  error,
  className,
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
              'flex items-center justify-center w-5 h-5 sm:w-5 sm:h-5 rounded border-2 transition-all duration-200 touch-manipulation',
              checked
                ? 'bg-[#F27A1A] border-[#F27A1A]'
                : 'bg-white border-gray-300 group-hover:border-gray-400 active:border-gray-500',
              disabled && 'group-hover:border-gray-300'
            )}
          >
            {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
          </div>
        </div>
        <span className="ml-2 sm:ml-3 text-xs sm:text-sm text-gray-700 leading-5 sm:leading-6">{label}</span>
      </label>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

