import React from 'react';
import type { FormQuestionWithOptionsAndRows } from '../../lib/formEngine';

interface GridTableQuestionProps {
  question: FormQuestionWithOptionsAndRows;
  value: Record<string, string> | null;
  onChange: (value: Record<string, string>) => void;
  disabled?: boolean;
  error?: string;
}

export const GridTableQuestion: React.FC<GridTableQuestionProps> = ({
  question,
  value,
  onChange,
  disabled,
  error,
}) => {
  const pm = (question.pdf_meta as Record<string, unknown>) || {};
  const columns: string[] = Array.isArray(pm.columns) ? (pm.columns as string[]) : ['Column 1', 'Column 2'];

  const updateCell = (rowId: number, colIndex: number, val: string) => {
    const key = `r${rowId}_c${colIndex}`;
    const next = { ...(value || {}), [key]: val };
    onChange(next);
  };

  const getCellValue = (rowId: number, colIndex: number): string => {
    const key = `r${rowId}_c${colIndex}`;
    return (value && value[key]) || '';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[400px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="border border-[var(--border)] bg-gray-50 p-2 text-left font-semibold text-gray-700 w-24">
              Shape
            </th>
            {columns.map((col, i) => (
              <th
                key={i}
                className="border border-[var(--border)] bg-gray-50 p-2 text-left font-semibold text-gray-700"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {question.rows.map((row) => (
            <tr key={row.id}>
              <td className="border border-[var(--border)] p-2 align-top">
                {row.row_image_url ? (
                  <img
                    src={row.row_image_url}
                    alt={row.row_label}
                    className="w-16 h-12 object-contain"
                  />
                ) : null}
                <div className="text-xs font-medium text-gray-700 mt-1">{row.row_label}</div>
              </td>
              {columns.map((_, colIndex) => (
                <td key={colIndex} className="border border-[var(--border)] p-2">
                  <input
                    type="text"
                    value={getCellValue(row.id, colIndex)}
                    onChange={(e) => updateCell(row.id, colIndex, e.target.value)}
                    disabled={disabled}
                    className="w-full px-2 py-1.5 rounded border border-[var(--border)] text-sm"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
