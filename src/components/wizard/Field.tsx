import React from 'react';

interface FieldProps {
  label: string;
  fieldId: string;
  type?: 'text' | 'email' | 'number' | 'date';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  tooltip?: string;
}

export const Field: React.FC<FieldProps> = ({
  label,
  fieldId,
  type = 'text',
  value,
  onChange,
  error,
  helperText,
  placeholder,
  required = false,
  disabled = false,
  tooltip,
}) => {
  return (
    <div className="mb-6">
      <label htmlFor={fieldId} className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-orange-600 ml-1">*</span>}
        {tooltip && (
          <span className="ml-2 text-gray-400 cursor-help" title={tooltip}>
            <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
        )}
      </label>
      <input
        id={fieldId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
          error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white'}`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
};

