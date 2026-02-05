import React from 'react';
import { CheckboxGroupSection } from '../../types/formDefinition';
import { useFormStore } from '../../store/formStore';
import { canViewField, canEditField } from '../../utils/roleUtils';
import { Card } from '../ui/Card';
import { Checkbox } from '../ui/Checkbox';

interface PremiumCheckboxGroupProps {
  section: CheckboxGroupSection;
  errors?: Record<string, string>;
}

export const PremiumCheckboxGroup: React.FC<PremiumCheckboxGroupProps> = ({ section, errors = {} }) => {
  const { role, answers, studentSubmitted, trainerSubmitted, updateAnswer } = useFormStore();

  return (
    <Card className="mb-4 sm:mb-6">
      <div className="mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{section.title}</h3>
        <p className="text-xs sm:text-sm text-gray-600">Please acknowledge the following declarations</p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {section.options.map((option) => {
          const canView = canViewField(role, option.roleScope);
          const canEdit = canEditField(role, option.roleScope, studentSubmitted, trainerSubmitted);
          const checked = answers[option.fieldId] || false;
          const error = errors[option.fieldId];

          if (!canView) return null;

          return (
            <Checkbox
              key={option.fieldId}
              label={option.label}
              checked={checked}
              onChange={(checked) => updateAnswer(option.fieldId, checked)}
              disabled={!canEdit}
              error={error}
            />
          );
        })}
      </div>
    </Card>
  );
};

