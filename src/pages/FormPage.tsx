import React from 'react';
import { FormDefinition, FormPage as FormPageType } from '../types/formDefinition';
import { FormSectionRenderer } from '../components/form/FormSectionRenderer';
import { Logo } from '../components/Logo';

interface FormPageProps {
  formDefinition: FormDefinition;
  page: FormPageType;
}

export const FormPage: React.FC<FormPageProps> = ({ formDefinition, page }) => {
  const addressLines = formDefinition.meta.orgAddress.split(',').map(line => line.trim());
  
  return (
    <div>
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border)]">
        <div className="flex-shrink-0">
          <Logo size="sm" />
        </div>
        <div className="flex-1 text-center px-4">
          <h1 className="text-xl font-bold text-[var(--brand)] mb-0.5">{formDefinition.meta.orgName}</h1>
          <p className="text-xs text-gray-600">{formDefinition.meta.title}</p>
        </div>
        <div className="w-48 text-right text-[10px] text-gray-500 leading-relaxed">
          {addressLines.slice(0, 2).map((line, i) => (
            <div key={i} className={line.includes('@') ? 'text-blue-600 underline' : ''}>
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Page Content - Each section in its own Card */}
      <div className="space-y-6">
        {page.sections.map((section, index) => (
          <FormSectionRenderer key={index} section={section} />
        ))}
      </div>
    </div>
  );
};

