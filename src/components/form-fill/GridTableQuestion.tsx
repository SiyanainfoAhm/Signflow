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
  const columnTypes = (pm.columnTypes as string[]) || columns.map(() => 'answer');
  const layout = (pm.layout as string) || 'default';
  const isSplit = layout === 'split' || layout === 'polygon';
  const isNoImage = layout === 'no_image';
  const firstCol = (pm.firstColumnLabel as string) || (isNoImage ? 'Item' : layout === 'polygon' ? 'Polygon Name' : 'Name');
  const secondCol = (pm.secondColumnLabel as string) || (isNoImage ? 'Description' : layout === 'polygon' ? 'Polygon Shape' : 'Image');

  const updateCell = (rowId: number, colIndex: number, val: string) => {
    const key = `r${rowId}_c${colIndex}`;
    const next = { ...(value || {}), [key]: val };
    onChange(next);
  };

  const getCellValue = (rowId: number, colIndex: number): string => {
    const key = `r${rowId}_c${colIndex}`;
    return (value && value[key]) || '';
  };

  const getColumnType = (colIndex: number): 'question' | 'answer' => {
    const t = columnTypes[colIndex];
    return t === 'question' ? 'question' : 'answer';
  };

  const cellClass = 'p-2 align-top bg-transparent border border-gray-300';
  const headerClass = 'p-2 text-left font-semibold text-gray-700 bg-transparent border border-gray-300';

  const renderCell = (row: { id: number; row_help?: string | null }, colIndex: number) => {
    const type = getColumnType(colIndex);
    if (type === 'question') {
      return (
        <td key={colIndex} className={`${cellClass} text-gray-600 text-sm`}>
          {row.row_help || '—'}
        </td>
      );
    }
    return (
      <td key={colIndex} className={cellClass}>
        <input
          type="text"
          value={getCellValue(row.id, colIndex)}
          onChange={(e) => updateCell(row.id, colIndex, e.target.value)}
          disabled={disabled}
          className="w-full px-2 py-1.5 text-sm bg-transparent border-none border-b border-gray-300 focus:border-[var(--brand)] focus:outline-none"
        />
      </td>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[400px] border-collapse text-sm border border-gray-300">
        <thead>
          <tr>
            {(isSplit || isNoImage) ? (
              <>
                {isSplit ? (
                  <th className={`${headerClass} w-24`}>
                    {secondCol}
                  </th>
                ) : (
                  <>
                    <th className={headerClass}>{firstCol}</th>
                    <th className={headerClass}>{secondCol}</th>
                  </>
                )}
                {columns.map((col, i) => (
                  <th key={i} className={headerClass}>
                    {col}
                  </th>
                ))}
              </>
            ) : (
              <>
                <th className={`${headerClass} w-24`}>
                  Shape
                </th>
                {columns.map((col, i) => (
                  <th key={i} className={headerClass}>
                    {col}
                  </th>
                ))}
              </>
            )}
          </tr>
        </thead>
        <tbody>
            {question.rows.map((row) => (
            <tr key={row.id}>
              {isSplit ? (
                <>
                  <td className={cellClass}>
                    <div className="flex flex-col items-start gap-1">
                      {row.row_image_url ? (
                        <>
                          <img
                            src={row.row_image_url}
                            alt={row.row_label}
                            className="w-16 h-12 object-contain block"
                          />
                          <span className="text-xs font-medium text-gray-700 block">{row.row_label}</span>
                        </>
                      ) : (
                        <span className="text-xs font-medium text-gray-700">{row.row_label}</span>
                      )}
                    </div>
                  </td>
                  {columns.map((_, colIndex) => renderCell(row, colIndex))}
                </>
              ) : isNoImage ? (
                <>
                  <td className={`${cellClass} font-medium text-gray-700`}>
                    {row.row_label}
                  </td>
                  <td className={`${cellClass} text-gray-600`}>
                    {row.row_help || '—'}
                  </td>
                  {columns.map((_, colIndex) => renderCell(row, colIndex))}
                </>
              ) : (
                <>
                  <td className={cellClass}>
                    <div className="flex flex-col items-start gap-1">
                      {row.row_image_url ? (
                        <img
                          src={row.row_image_url}
                          alt={row.row_label}
                          className="w-16 h-12 object-contain block"
                        />
                      ) : null}
                      <span className="text-xs font-medium text-gray-700 block">{row.row_label}</span>
                    </div>
                  </td>
                  {columns.map((_, colIndex) => renderCell(row, colIndex))}
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
