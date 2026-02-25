import React from 'react';
import { Checkbox } from '../ui/Checkbox';
import {
  APPENDIX_A_TABLE1,
  APPENDIX_A_TABLE2,
  type AppendixAMatrixValue,
} from '../../lib/appendixAMatrixData';

interface AppendixAMatrixFormProps {
  value: AppendixAMatrixValue | null;
  onChange: (value: AppendixAMatrixValue) => void;
  disabled?: boolean;
}

export const AppendixAMatrixForm: React.FC<AppendixAMatrixFormProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const checked = value && typeof value === 'object' ? value : {};

  const toggle = (id: string, checkedVal: boolean) => {
    onChange({ ...checked, [id]: checkedVal });
  };

  return (
    <div className="space-y-6">
      <div className="text-sm font-semibold text-gray-700 mb-2">
        Reasonable Adjustment Strategies Matrix (select as applicable)
      </div>
      <div className="overflow-x-auto border border-gray-300 rounded-lg">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#5E5E5E] text-white">
              <th className="p-2 text-left font-semibold border border-gray-400">Category</th>
              <th className="p-2 text-left font-semibold border border-gray-400">Possible Issue</th>
              <th className="p-2 text-left font-semibold border border-gray-400">Reasonable Adjustment Strategy (select as applicable)</th>
            </tr>
          </thead>
          <tbody>
            {APPENDIX_A_TABLE1.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="p-2 border border-gray-300 align-top">
                  <Checkbox
                    label={row.category.label}
                    checked={!!checked[row.category.id]}
                    onChange={(v) => toggle(row.category.id, v)}
                    disabled={disabled}
                  />
                </td>
                <td className="p-2 border border-gray-300 align-top space-y-1">
                  {row.issues.map((item) => (
                    <Checkbox
                      key={item.id}
                      label={item.label}
                      checked={!!checked[item.id]}
                      onChange={(v) => toggle(item.id, v)}
                      disabled={disabled}
                    />
                  ))}
                </td>
                <td className="p-2 border border-gray-300 align-top space-y-1">
                  {row.strategies.map((item) => (
                    <Checkbox
                      key={item.id}
                      label={item.label}
                      checked={!!checked[item.id]}
                      onChange={(v) => toggle(item.id, v)}
                      disabled={disabled}
                    />
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-sm font-semibold text-gray-700 mb-2">
        Reasonable Adjustment Strategies Matrix (Trainer/Assessor to complete)
      </div>
      <div className="overflow-x-auto border border-gray-300 rounded-lg">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#5E5E5E] text-white">
              <th className="p-2 text-left font-semibold border border-gray-400">Category</th>
              <th className="p-2 text-left font-semibold border border-gray-400">Reasonable Adjustment Strategy (select as applicable)</th>
            </tr>
          </thead>
          <tbody>
            {APPENDIX_A_TABLE2.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="p-2 border border-gray-300 align-top space-y-1">
                  {row.categoryItems.map((item) => (
                    <Checkbox
                      key={item.id}
                      label={item.label}
                      checked={!!checked[item.id]}
                      onChange={(v) => toggle(item.id, v)}
                      disabled={disabled}
                    />
                  ))}
                </td>
                <td className="p-2 border border-gray-300 align-top space-y-1">
                  {row.strategies.map((item) => (
                    <Checkbox
                      key={item.id}
                      label={item.label}
                      checked={!!checked[item.id]}
                      onChange={(v) => toggle(item.id, v)}
                      disabled={disabled}
                    />
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
