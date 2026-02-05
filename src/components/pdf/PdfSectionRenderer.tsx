import React from 'react';
import { FormSection } from '../../types/formDefinition';
import { Role, FormAnswers, SignatureData } from '../../types';
import { PdfDetailsTable } from './PdfDetailsTable';
import { PdfLikertTable } from './PdfLikertTable';
import { PdfTextarea } from './PdfTextarea';
import { PdfCheckboxGroup } from './PdfCheckboxGroup';
import { PdfSignatureBlock } from './PdfSignatureBlock';

interface PdfSectionRendererProps {
  section: FormSection;
  role: Role;
  answers: FormAnswers;
  studentSignature: SignatureData;
  trainerSignature: SignatureData;
}

export const PdfSectionRenderer: React.FC<PdfSectionRendererProps> = ({
  section,
  role,
  answers,
  studentSignature,
  trainerSignature,
}) => {
  switch (section.type) {
    case 'detailsTable':
      return <PdfDetailsTable section={section} role={role} answers={answers} />;
    case 'likertMatrix':
      return <PdfLikertTable section={section} role={role} answers={answers} />;
    case 'textarea':
      return <PdfTextarea section={section} role={role} answers={answers} />;
    case 'checkboxGroup':
      return <PdfCheckboxGroup section={section} role={role} answers={answers} />;
    case 'signatureBlock':
      return (
        <PdfSignatureBlock
          section={section}
          role={role}
          answers={answers}
          studentSignature={studentSignature}
          trainerSignature={trainerSignature}
        />
      );
    default:
      return null;
  }
};

