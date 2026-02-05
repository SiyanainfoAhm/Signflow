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
    <div className="sticky bottom-0 bg-white border-t border-[var(--border)] shadow-lg -mx-6 -mb-6 px-6 py-5 mt-8">
      {/* Progress Bar */}
      <div className="mb-4">
        <Progress value={completionPercent} showLabel />
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} disabled={!canGoBack} size="md">
            ← Back
          </Button>
          {onSaveDraft && (
            <Button variant="ghost" onClick={onSaveDraft} size="md" className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Draft
            </Button>
          )}
        </div>

        <div className="text-sm text-gray-600 font-medium">
          Step {currentStep} of {totalSteps}
        </div>

        <Button variant="primary" onClick={onNext} disabled={!canGoNext} size="md">
          {isLastStep ? 'Review & Export' : 'Next →'}
        </Button>
      </div>
    </div>
  );
};

