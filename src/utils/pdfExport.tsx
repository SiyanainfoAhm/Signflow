import { pdf } from '@react-pdf/renderer';
import { PdfDocument } from '../components/pdf/PdfDocument';
import type { FormDefinition } from '../types/formDefinition';
import type { Role } from '../types';
import { useFormStore } from '../store/formStore';
import formDefinitionData from '../data/formDefinition.json';
import { registerPdfFonts } from './fontLoader';

export async function exportPdf(role: Role) {
  // Ensure fonts are registered before generating PDF
  await registerPdfFonts();

  const formDefinition = formDefinitionData as FormDefinition;
  const { answers, studentSignature, trainerSignature } = useFormStore.getState();

  // Create the PDF document element
  const doc = (
    <PdfDocument
      formDefinition={formDefinition}
      role={role}
      answers={answers}
      studentSignature={studentSignature}
      trainerSignature={trainerSignature}
    />
  );

  const asPdf = pdf(doc);
  const blob = await asPdf.toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `training-evaluation-form-${role}-${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

