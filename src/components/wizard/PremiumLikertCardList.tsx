import React from 'react';
import { LikertMatrixSection } from '../../types/formDefinition';
import { useFormStore } from '../../store/formStore';
import { canViewField, canEditField } from '../../utils/roleUtils';
import { Card } from '../ui/Card';

interface PremiumLikertCardListProps {
  section: LikertMatrixSection;
  errors?: Record<string, string>;
}

export const PremiumLikertCardList: React.FC<PremiumLikertCardListProps> = ({ section, errors = {} }) => {
  const { role, answers, studentSubmitted, trainerSubmitted, updateAnswer } = useFormStore();

  const scaleValues = [1, 2, 3, 4, 5];
  const scaleLabels =
    section.scaleLabels?.length === 5
      ? section.scaleLabels
      : ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

  return (
    <Card className="mb-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{section.title}</h3>
        <p className="text-sm text-gray-600">
          Please rate each statement by selecting the option that best reflects your opinion.
        </p>
      </div>

      {/* Legend */}
      <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between text-xs font-medium text-gray-600">
          <span>1 - {scaleLabels[0]}</span>
          <span>2 - {scaleLabels[1]}</span>
          <span>3 - {scaleLabels[2]}</span>
          <span>4 - {scaleLabels[3]}</span>
          <span>5 - {scaleLabels[4]}</span>
        </div>
      </div>

      <div className="space-y-4">
        {section.questions.map((question) => {
          const canView = canViewField(role, question.roleScope);
          const canEdit = canEditField(role, question.roleScope, studentSubmitted, trainerSubmitted);
          const selectedValue = answers[question.fieldId];
          const error = errors[question.fieldId];

          if (!canView) return null;

          return (
            <div
              key={question.fieldId}
              className={`p-5 bg-white border rounded-card transition-all ${
                error
                  ? 'border-red-300 bg-red-50'
                  : 'border-[var(--border)] hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <p className="text-sm font-medium text-[var(--text)] mb-4 leading-relaxed">{question.question}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {scaleValues.map((value) => {
                  const isSelected = selectedValue === value;
                  const label = scaleLabels[value - 1];
                  const shortLabel = label.split(' ')[0]; // SD, D, N, A, SA

                  return (
                    <label
                      key={value}
                      className={`relative flex-1 min-w-[70px] cursor-pointer group ${
                        !canEdit ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name={question.fieldId}
                        value={value}
                        checked={isSelected}
                        onChange={() => updateAnswer(question.fieldId, value)}
                        disabled={!canEdit}
                        className="sr-only"
                      />
                      <div
                        className={`relative px-3 py-2.5 rounded-lg border text-center transition-all duration-200 ${
                          isSelected
                            ? 'border-[var(--brand)] bg-orange-50 text-[var(--brand)] font-semibold shadow-sm'
                            : 'border-[var(--border)] bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50'
                        } ${!canEdit ? 'hover:border-[var(--border)] hover:bg-white' : ''}`}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <div
                            className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? 'border-[var(--brand)] bg-white'
                                : 'border-gray-400 bg-white group-hover:border-orange-400'
                            }`}
                          >
                            {isSelected && (
                              <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand)]" />
                            )}
                          </div>
                          <span className="text-xs font-semibold">{value}</span>
                          <span className="text-[10px] text-gray-600 hidden sm:inline">{shortLabel}</span>
                        </div>
                        <div className="mt-1 text-[9px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                          {label}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
              {error && <p className="mt-3 text-sm text-red-600 font-medium">{error}</p>}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

