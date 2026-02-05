import React from 'react';
import { LikertMatrixSection } from '../../types/formDefinition';
import { useFormStore } from '../../store/formStore';
import { canViewField, canEditField } from '../../utils/roleUtils';
import { Card } from '../ui/Card';

interface LikertMatrixProps {
  section: LikertMatrixSection;
}

export const LikertMatrix: React.FC<LikertMatrixProps> = ({ section }) => {
  const { role, answers, studentSubmitted, trainerSubmitted, updateAnswer } = useFormStore();

  const scaleValues = [1, 2, 3, 4, 5];
  const scaleLabels =
    section.scaleLabels?.length === 5
      ? section.scaleLabels
      : ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

  const shortLabels = ['SD', 'D', 'N', 'A', 'SA'];

  return (
    <Card className="mb-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[var(--text)] mb-1">{section.title}</h3>
        <p className="text-sm text-gray-600">Please rate each statement</p>
      </div>

      {/* Legend */}
      <div className="mb-6 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-end gap-2">
          {scaleValues.map((value) => (
            <div
              key={value}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg border border-gray-200"
              title={scaleLabels[value - 1]}
            >
              {value}: {shortLabels[value - 1]}
            </div>
          ))}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {section.questions.map((question, qIndex) => {
          const canView = canViewField(role, question.roleScope);
          const canEdit = canEditField(role, question.roleScope, studentSubmitted, trainerSubmitted);
          const selectedValue = answers[question.fieldId];

          if (!canView) return null;

          return (
            <div
              key={question.fieldId}
              className="flex items-start gap-4 p-4 rounded-lg border border-[var(--border)] bg-white hover:border-orange-300 transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                {qIndex + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text)] mb-3">{question.question}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {scaleValues.map((value) => {
                    const isSelected = selectedValue === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => canEdit && updateAnswer(question.fieldId, value)}
                        disabled={!canEdit}
                        className={`
                          relative px-4 py-2 rounded-lg text-sm font-medium transition-all
                          ${
                            isSelected
                              ? 'bg-orange-50 border-2 border-orange-500 text-orange-700 shadow-sm'
                              : 'bg-white border border-gray-300 text-gray-700 hover:border-orange-300 hover:bg-orange-50'
                          }
                          ${!canEdit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        title={scaleLabels[value - 1]}
                      >
                        <span className="block">{value}</span>
                        <span className="text-xs text-gray-500 mt-0.5 block">{shortLabels[value - 1]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

