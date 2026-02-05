import React from 'react';
import { FormSection } from '../../types/formDefinition';
import { PremiumDetailsTable } from '../wizard/PremiumDetailsTable';
import { PremiumLikertCardList } from '../wizard/PremiumLikertCardList';
import { PremiumTextarea } from '../wizard/PremiumTextarea';
import { PremiumCheckboxGroup } from '../wizard/PremiumCheckboxGroup';
import { PremiumSignatureBlock } from '../wizard/PremiumSignatureBlock';

interface FormSectionRendererProps {
  section: FormSection;
  errors?: Record<string, string>;
}

export const FormSectionRenderer: React.FC<FormSectionRendererProps> = ({ section, errors = {} }) => {
  switch (section.type) {
    case 'detailsTable':
      return <PremiumDetailsTable section={section} errors={errors} />;
    case 'likertMatrix':
      return <PremiumLikertCardList section={section} errors={errors} />;
    case 'textarea':
      return <PremiumTextarea section={section} errors={errors} />;
    case 'checkboxGroup':
      return <PremiumCheckboxGroup section={section} errors={errors} />;
    case 'signatureBlock':
      return <PremiumSignatureBlock section={section} errors={errors} />;
    default:
      return null;
  }
};

