import React from 'react';
import { LikertMatrixSection } from '../../types/formDefinition';
import { useFormStore } from '../../store/formStore';
import { canViewField, canEditField } from '../../utils/roleUtils';

interface LikertCardListProps {
  section: LikertMatrixSection;
}

export const LikertCardList: React.FC<LikertCardListProps> = ({ section }) => {
  const { role, answers, studentSubmitted, trainerSubmitted, updateAnswer } = useFormStore();

  const scaleValues = [1, 2, 3, 4, 5];
  const scaleLabels =
    section.scaleLabels?.length === 5
      ? section.scaleLabels
      : ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{section.title}</h3>
        <p className="text-sm text-gray-600">
          Please rate each statement by selecting the option that best reflects your opinion.
        </p>
      </div>

      <div className="space-y-4">
        {section.questions.map((question) => {
          const canView = canViewField(role, question.roleScope);
          const canEdit = canEditField(role, question.roleScope, studentSubmitted, trainerSubmitted);
          const selectedValue = answers[question.fieldId];

          if (!canView) return null;

          return (
            <div
              key={question.fieldId}
              className="bg-white border-2 border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-sm font-medium text-gray-700 mb-4">{question.question}</p>
              <div className="flex flex-wrap gap-3">
                {scaleValues.map((value) => {
                  const isSelected = selectedValue === value;
                  const label = scaleLabels[value - 1];

                  return (
                    <label
                      key={value}
                      className={`flex-1 min-w-[120px] cursor-pointer ${
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
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          isSelected
                            ? 'border-orange-600 bg-orange-50 text-orange-700 font-semibold'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50'
                        } ${!canEdit ? 'hover:border-gray-300 hover:bg-white' : ''}`}
                      >
                        <div className="text-xs font-medium mb-1">{value}</div>
                        <div className="text-xs">{label}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

