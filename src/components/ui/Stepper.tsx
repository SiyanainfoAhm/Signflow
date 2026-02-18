import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../utils/cn';

interface Step {
  number: number;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, className }) => {
  return (
    <div className={cn('mb-4 sm:mb-6 md:mb-8', className)}>
      {/* Mobile: compact rail + active step label below */}
      <div className="block sm:hidden">
        <div className="flex items-start overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
          {steps.map((step, index) => {
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;
            const isLast = index === steps.length - 1;

            return (
              <React.Fragment key={step.number}>
                <div className="flex items-center min-w-[56px]">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 flex-shrink-0',
                        isCompleted
                          ? 'bg-[var(--brand)] text-white shadow-sm'
                          : isActive
                          ? 'bg-[var(--brand)] text-white ring-2 ring-orange-100 shadow-sm'
                          : 'bg-gray-200 text-gray-500'
                      )}
                    >
                      {isCompleted ? <Check className="w-4 h-4" strokeWidth={3} /> : step.number}
                    </div>
                  </div>
                  {!isLast && (
                    <div
                      className={cn(
                        'flex-1 h-0.5 mx-1 mt-4 transition-all duration-300 min-w-[16px]',
                        isCompleted ? 'bg-[var(--brand)]' : 'bg-gray-200'
                      )}
                    />
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
        {/* Active step label + description */}
        {(() => {
          const active = steps.find((s) => s.number === currentStep);
          if (!active) return null;
          return (
            <div className="mt-2 px-1">
              <div className="text-xs font-semibold text-[var(--brand)] truncate">{active.label}</div>
              {active.description && (
                <div className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{active.description}</div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Tablet / Desktop: full stepper with labels */}
      <div className="hidden sm:block">
        <div className="flex items-start justify-between overflow-x-auto pb-4 scrollbar-hide -mx-2 sm:mx-0 px-2 sm:px-0 gap-2">
          {steps.map((step, index) => {
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;
            const isLast = index === steps.length - 1;

            return (
              <React.Fragment key={step.number}>
                <div className="flex items-center flex-1 min-w-0 max-w-[180px]">
                  {/* Step Circle and Label */}
                  <div className="flex flex-col items-center flex-shrink-0 w-full">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 flex-shrink-0',
                        isCompleted
                          ? 'bg-[var(--brand)] text-white shadow-sm'
                          : isActive
                          ? 'bg-[var(--brand)] text-white ring-2 ring-orange-100 shadow-sm'
                          : 'bg-gray-200 text-gray-500'
                      )}
                    >
                      {isCompleted ? <Check className="w-4 h-4" strokeWidth={3} /> : step.number}
                    </div>
                    {/* Step Label */}
                    <div className="mt-2 text-center w-full px-1">
                      <div
                        className={cn(
                          'text-[10px] font-semibold leading-tight break-words line-clamp-2',
                          isActive ? 'text-[var(--brand)]' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                        )}
                        title={step.label}
                      >
                        {step.label}
                      </div>
                      {step.description && (
                        <div className="text-[9px] text-gray-500 mt-0.5 leading-tight line-clamp-2 max-w-full mx-auto">
                          {step.description}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Connector Line */}
                  {!isLast && (
                    <div
                      className={cn(
                        'flex-1 h-0.5 mx-1 mt-4 transition-all duration-300 min-w-[8px]',
                        isCompleted ? 'bg-[var(--brand)]' : 'bg-gray-200'
                      )}
                    />
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

