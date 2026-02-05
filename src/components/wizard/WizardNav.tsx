import React from 'react';

interface WizardNavProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  isLastStep: boolean;
  completionPercent: number;
}

export const WizardNav: React.FC<WizardNavProps> = ({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  canGoBack,
  canGoNext,
  isLastStep,
  completionPercent,
}) => {
  return (
    <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 shadow-lg p-4 mt-8">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-semibold text-orange-600">{Math.round(completionPercent)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-orange-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            canGoBack
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-sm hover:shadow-md'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          ← Back
        </button>

        <div className="text-sm text-gray-600 font-medium">
          Step {currentStep} of {totalSteps}
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            canGoNext
              ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-sm hover:shadow-md'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLastStep ? 'Review & Export' : 'Next →'}
        </button>
      </div>
    </div>
  );
};

