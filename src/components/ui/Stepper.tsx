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
    <div className={cn('mb-8', className)}>
      <div className="flex items-start justify-between overflow-x-auto pb-4">
        {steps.map((step, index) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.number}>
              <div className="flex items-center flex-1 min-w-0">
                {/* Step Circle and Label */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 flex-shrink-0',
                      isCompleted
                        ? 'bg-[var(--brand)] text-white shadow-sm'
                        : isActive
                        ? 'bg-[var(--brand)] text-white ring-4 ring-orange-100 shadow-sm'
                        : 'bg-gray-200 text-gray-500'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" strokeWidth={3} />
                    ) : (
                      step.number
                    )}
                  </div>
                  {/* Step Label */}
                  <div className="mt-2 text-center w-full">
                    <div
                      className={cn(
                        'text-xs font-semibold whitespace-nowrap',
                        isActive ? 'text-[var(--brand)]' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                      )}
                    >
                      {step.label}
                    </div>
                    {step.description && (
                      <div className="text-xs text-gray-500 mt-1 hidden lg:block max-w-[120px] mx-auto">
                        {step.description}
                      </div>
                    )}
                  </div>
                </div>
                {/* Connector Line */}
                {!isLast && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-2 mt-5 transition-all duration-300',
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
  );
};

