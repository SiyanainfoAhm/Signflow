import React from 'react';
import { cn } from '../utils/cn';

interface RadioOption {
  value: string | number;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  name: string;
  value?: string | number;
  onChange: (value: string | number) => void;
  options: RadioOption[];
  disabled?: boolean;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  onChange,
  options,
  disabled,
  className,
  orientation = 'horizontal',
}) => {
  return (
    <div
      className={cn(
        'flex gap-3',
        orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        className
      )}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        const optionId = `${name}-${option.value}`;

        return (
          <label
            key={option.value}
            htmlFor={optionId}
            className={cn(
              'relative flex items-center cursor-pointer',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input
              type="radio"
              id={optionId}
              name={name}
              value={option.value}
              checked={isSelected}
              onChange={() => !disabled && onChange(option.value)}
              disabled={disabled}
              className="sr-only"
            />
            <div
              className={cn(
                'flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-200',
                isSelected
                  ? 'border-[#F27A1A] bg-white'
                  : 'border-gray-300 bg-white hover:border-gray-400',
                disabled && 'hover:border-gray-300'
              )}
            >
              {isSelected && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#F27A1A]" />
              )}
            </div>
            <span className="ml-2.5 text-sm text-gray-700">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
};

