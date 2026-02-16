import React from 'react';
import type { FormSectionWithQuestions } from '../../lib/formEngine';

const SCALE = [1, 2, 3, 4, 5] as const;
const SCALE_LABELS = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

const getSectionCode = (title: string): string => {
  const t = title.toLowerCase();
  if (t.includes('logistics')) return 'A';
  if (t.includes('trainer') || t.includes('assessor')) return 'B';
  if (t.includes('learning')) return 'C';
  return '';
};

interface SectionLikertTableProps {
  section: FormSectionWithQuestions;
  getAnswer: (questionId: number, rowId: number) => string | null;
  onChange: (questionId: number, rowId: number, value: string) => void;
  disabled?: boolean;
}

export const SectionLikertTable: React.FC<SectionLikertTableProps> = ({
  section,
  getAnswer,
  onChange,
  disabled,
}) => {
  const likertQuestions = section.questions.filter((q) => q.type === 'likert_5' && q.rows.length > 0);
  if (likertQuestions.length === 0) return null;

  const sectionCode = getSectionCode(section.title);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[500px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="border border-[var(--border)] bg-gray-600 text-white p-2 text-center font-semibold w-12">
              No.
            </th>
            <th className="border border-[var(--border)] bg-gray-600 text-white p-2 text-left font-semibold">
              Criteria/Question
            </th>
            {SCALE_LABELS.map((label) => (
              <th
                key={label}
                className="border border-[var(--border)] bg-gray-600 text-white p-2 text-center font-semibold text-xs min-w-[70px]"
              >
                {label}
              </th>
            ))}
          </tr>
          <tr>
            <td className="border border-[var(--border)] bg-gray-500 text-white p-2 text-center font-semibold w-12">
              {sectionCode}
            </td>
            <td className="border border-[var(--border)] bg-gray-500 text-white p-2 font-semibold" colSpan={6}>
              {section.title}
            </td>
          </tr>
        </thead>
        <tbody>
          {likertQuestions.map((q, idx) => {
            const row = q.rows[0];
            const currentVal = row ? getAnswer(q.id, row.id) : null;
            return (
              <tr key={q.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-[var(--border)] p-2 text-center font-medium text-gray-700 bg-gray-100">
                  {idx + 1}
                </td>
                <td className="border border-[var(--border)] p-2 text-gray-700 bg-gray-100">
                  {row?.row_label ?? q.label}
                </td>
                {SCALE.map((n) => (
                  <td key={n} className="border border-[var(--border)] p-2 text-center">
                    <label className="flex items-center justify-center cursor-pointer">
                      <input
                        type="radio"
                        name={`q-${q.id}-${row?.id}`}
                        checked={currentVal === String(n)}
                        onChange={() => row && onChange(q.id, row.id, String(n))}
                        disabled={disabled}
                        className="w-4 h-4 accent-[var(--brand)]"
                      />
                    </label>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
