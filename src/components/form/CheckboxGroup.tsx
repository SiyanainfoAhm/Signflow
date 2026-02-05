import React from 'react';
import { CheckboxGroupSection } from '../../types/formDefinition';
import { useFormStore } from '../../store/formStore';
import { canViewField, canEditField } from '../../utils/roleUtils';
import { Card } from '../ui/Card';
import { Checkbox } from '../ui/Checkbox';

interface CheckboxGroupProps {
  section: CheckboxGroupSection;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ section }) => {
  const { role, answers, studentSubmitted, trainerSubmitted, updateAnswer } = useFormStore();

  return (
    <Card className="mb-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[var(--text)] mb-1">{section.title}</h3>
        <p className="text-sm text-gray-600">Please select all that apply</p>
      </div>
      <div className="space-y-3">
        {section.options.map((option) => {
          const canView = canViewField(role, option.roleScope);
          const canEdit = canEditField(role, option.roleScope, studentSubmitted, trainerSubmitted);
          const checked = answers[option.fieldId] || false;

          if (!canView) return null;

          return (
            <Checkbox
              key={option.fieldId}
              label={option.label}
              checked={checked}
              onChange={(checked) => updateAnswer(option.fieldId, checked)}
              disabled={!canEdit}
            />
          );
        })}
      </div>
    </Card>
  );
};

