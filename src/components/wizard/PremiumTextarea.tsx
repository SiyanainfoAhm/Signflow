import React from 'react';
import { TextareaSection as TextareaSectionType } from '../../types/formDefinition';
import { useFormStore } from '../../store/formStore';
import { canViewField, canEditField } from '../../utils/roleUtils';
import { Card } from '../ui/Card';
import { Textarea } from '../ui/Textarea';

interface PremiumTextareaProps {
  section: TextareaSectionType;
  errors?: Record<string, string>;
}

export const PremiumTextarea: React.FC<PremiumTextareaProps> = ({ section, errors = {} }) => {
  const { role, answers, studentSubmitted, trainerSubmitted, updateAnswer } = useFormStore();

  const canView = canViewField(role, section.roleScope);
  const canEdit = canEditField(role, section.roleScope, studentSubmitted, trainerSubmitted);
  const value = answers[section.fieldId] || '';
  const error = errors[section.fieldId];

  if (!canView) return null;

  return (
    <Card className="mb-4 sm:mb-6">
      <Textarea
        label={section.label}
        value={value}
        onChange={(e) => updateAnswer(section.fieldId, e.target.value)}
        disabled={!canEdit}
        rows={section.rows || 6}
        error={error}
        placeholder="Enter your comments here..."
      />
    </Card>
  );
};

