import React from 'react';
import { DetailsTableSection } from '../../types/formDefinition';
import { useFormStore } from '../../store/formStore';
import { canViewField, canEditField } from '../../utils/roleUtils';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

interface PremiumDetailsTableProps {
  section: DetailsTableSection;
  errors?: Record<string, string>;
}

export const PremiumDetailsTable: React.FC<PremiumDetailsTableProps> = ({ section, errors = {} }) => {
  const { role, answers, studentSubmitted, trainerSubmitted, updateAnswer } = useFormStore();

  // Group fields by prefix to create sub-sections
  const groupFields = () => {
    const groups: { [key: string]: typeof section.fields } = {};

    section.fields.forEach((field) => {
      const prefix = field.fieldId.split('.')[0];
      const groupKey =
        prefix === 'student'
          ? 'Student Details'
          : prefix === 'trainer'
          ? 'Trainer Details'
          : prefix === 'qualification'
          ? 'Qualification Details'
          : prefix === 'unit'
          ? 'Unit of Competency'
          : prefix === 'office'
          ? 'Office Use Only'
          : 'Other';

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(field);
    });

    return groups;
  };

  const fieldGroups = groupFields();

  return (
    <Card className="mb-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{section.title}</h3>
        <p className="text-sm text-gray-600">Please provide the following information</p>
      </div>

      <div className="space-y-6">
        {Object.entries(fieldGroups).map(([groupName, fields]) => (
          <div key={groupName} className="space-y-4">
            <div className="pb-2 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {groupName}
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((field) => {
                // Allow viewing for both roles, but editing only for the owner
                const fieldPrefix = field.fieldId.split('.')[0];
                const canView = 
                  canViewField(role, field.roleScope) || 
                  (fieldPrefix === 'student' && (role === 'student' || role === 'trainer' || role === 'office')) ||
                  (fieldPrefix === 'trainer' && (role === 'student' || role === 'trainer' || role === 'office')) ||
                  (fieldPrefix === 'office' && role === 'office');
                const canEdit = canEditField(role, field.roleScope, studentSubmitted, trainerSubmitted);
                const value = answers[field.fieldId] || '';
                const error = errors[field.fieldId];

                if (!canView) return null;

                return (
                  <Input
                    key={field.fieldId}
                    label={field.label}
                    type={field.type}
                    value={value}
                    onChange={(e) => updateAnswer(field.fieldId, e.target.value)}
                    disabled={!canEdit}
                    error={error}
                    required={canEdit}
                    placeholder={field.type === 'date' ? 'Select date' : `Enter ${field.label.toLowerCase()}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

