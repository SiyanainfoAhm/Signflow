import React from 'react';
import { cn } from '../utils/cn';

interface ProgressProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({ value, className, showLabel = false }) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-semibold text-[var(--brand)]">{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-[var(--brand)] h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};

