import React from 'react';
import type { FormQuestionWithOptionsAndRows } from '../../lib/formEngine';

interface LikertTableQuestionProps {
  question: FormQuestionWithOptionsAndRows;
  value: string | number | Record<string, string> | null;
  onChange: (value: string | Record<string, string>) => void;
  disabled?: boolean;
  error?: string;
}

const SCALE = [1, 2, 3, 4, 5] as const;
const SCALE_LABELS = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

export const LikertTableQuestion: React.FC<LikertTableQuestionProps> = ({
  question,
  value,
  onChange,
  disabled,
  error,
}) => {
  if (question.rows.length === 0) return null;

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
        </thead>
        <tbody>
          {question.rows.map((row, idx) => {
            const rowKey = `row-${row.id}`;
            const currentVal =
              value == null
                ? null
                : typeof value === 'string'
                ? question.rows.length === 1
                  ? value
                  : null
                : (typeof value === 'object' && value && !Array.isArray(value) ? value : {} as Record<string, string>)[rowKey] ?? null;
            return (
              <tr key={row.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-[var(--border)] p-2 text-center font-medium text-gray-700 bg-gray-100">
                  {idx + 1}
                </td>
                <td className="border border-[var(--border)] p-2 text-gray-700 bg-gray-100">
                  {row.row_label}
                </td>
                {SCALE.map((n) => (
                  <td key={n} className="border border-[var(--border)] p-2 text-center">
                    <label className="flex items-center justify-center cursor-pointer">
                      <input
                        type="radio"
                        name={`q-${question.id}-${row.id}`}
                        checked={currentVal === String(n)}
                        onChange={() => {
                          if (question.rows.length === 1) {
                            onChange(String(n));
                          } else {
                            const prev = (typeof value === 'object' && value) ? { ...(value as Record<string, string>) } : {};
                            prev[rowKey] = String(n);
                            onChange(prev);
                          }
                        }}
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
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
