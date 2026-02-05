import React from 'react';

interface Step {
  number: number;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  {/* Step Circle */}
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        isCompleted
                          ? 'bg-orange-600 text-white'
                          : isActive
                          ? 'bg-orange-600 text-white ring-4 ring-orange-200'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        step.number
                      )}
                    </div>
                    {/* Step Label */}
                    <div className="mt-2 text-center">
                      <div
                        className={`text-xs font-semibold ${
                          isActive ? 'text-orange-600' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </div>
                      {step.description && (
                        <div className="text-xs text-gray-500 mt-1 hidden lg:block">{step.description}</div>
                      )}
                    </div>
                  </div>
                  {/* Connector Line */}
                  {!isLast && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-all ${
                        isCompleted ? 'bg-orange-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

