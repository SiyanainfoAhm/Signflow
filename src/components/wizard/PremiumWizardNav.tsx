import React from 'react';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';
import { Save } from 'lucide-react';

interface PremiumWizardNavProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft?: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  isLastStep: boolean;
  completionPercent: number;
}

export const PremiumWizardNav: React.FC<PremiumWizardNavProps> = ({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSaveDraft,
  canGoBack,
  canGoNext,
  isLastStep,
  completionPercent,
}) => {
  return (
    <div className="sticky bottom-0 bg-white border-t border-[var(--border)] shadow-lg -mx-3 sm:-mx-4 md:-mx-6 -mb-3 sm:-mb-4 md:-mb-6 px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 mt-4 sm:mt-6 md:mt-8">
      {/* Progress Bar */}
      <div className="mb-3 sm:mb-4">
        <Progress value={completionPercent} showLabel />
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="flex gap-2 sm:gap-3 order-2 sm:order-1">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={!canGoBack}
            size="sm"
            className="flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4"
          >
            ← Back
          </Button>
          {onSaveDraft && (
            <Button
              variant="ghost"
              onClick={onSaveDraft}
              size="sm"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Save className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              <span className="hidden sm:inline">Save Draft</span>
              <span className="sm:hidden">Save</span>
            </Button>
          )}
        </div>

        <div className="text-xs sm:text-sm text-gray-600 font-medium text-center sm:text-left order-1 sm:order-2">
          Step {currentStep} of {totalSteps}
        </div>

        <Button
          variant="primary"
          onClick={onNext}
          disabled={!canGoNext}
          size="sm"
          className="order-3 text-xs sm:text-sm px-4 sm:px-6 py-2.5 sm:py-3"
        >
          {isLastStep ? (
            <>
              <span className="hidden sm:inline">Review & Export</span>
              <span className="sm:hidden">Export</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Next →</span>
              <span className="sm:hidden">Next</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

