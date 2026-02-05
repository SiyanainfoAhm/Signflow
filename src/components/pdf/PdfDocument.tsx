import React from 'react';
import { Document, Page, View, StyleSheet } from '@react-pdf/renderer';
import { FormDefinition, FormPage as FormPageType, FormSection, LikertMatrixSection } from '../../types/formDefinition';
import { Role, FormAnswers, SignatureData } from '../../types';
import { PdfSectionRenderer } from './PdfSectionRenderer';
import { PdfHeader } from './PdfHeader';
import { PdfFooter } from './PdfFooter';
import '../../utils/fontLoader'; // Register fonts on import

// Section ordering for Likert sections
const SECTION_ORDER: Record<string, number> = { A: 1, B: 2, C: 3 };

const getSectionCode = (title: string): string => {
  const t = title.toLowerCase();
  if (t.includes('logistics')) return 'A';
  if (t.includes('trainer/assessor')) return 'B';
  if (t.includes('learning')) return 'C';
  return 'Z';
};

// Check if section is part of declarations/signature group
const isDeclarationsGroup = (section: FormSection): boolean => {
  if (section.type === 'checkboxGroup' && section.title.toLowerCase().includes('final declaration')) {
    return true;
  }
  if (section.type === 'signatureBlock') {
    return true;
  }
  if (section.type === 'detailsTable' && section.title.toLowerCase().includes('office use')) {
    return true;
  }
  return false;
};

interface PdfDocumentProps {
  formDefinition: FormDefinition;
  role: Role;
  answers: FormAnswers;
  studentSignature: SignatureData;
  trainerSignature: SignatureData;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 36,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  content: {
    // Leave space for fixed header + divider
    marginTop: 95,
    // Leave space for fixed footer
    marginBottom: 30,
  },
});


export const PdfDocument: React.FC<PdfDocumentProps> = ({
  formDefinition,
  role,
  answers,
  studentSignature,
  trainerSignature,
}) => {
  // Collect all Likert sections from all pages and sort them
  const allLikertSections: Array<{ section: LikertMatrixSection; comment: FormSection | null }> = [];
  const allOtherSections: Array<{ page: FormPageType; sections: FormSection[] }> = [];
  const allDeclarations: Array<{ page: FormPageType; sections: FormSection[] }> = [];

  formDefinition.pages.forEach((page) => {
    const likertSections: LikertMatrixSection[] = [];
    const textareaSections: FormSection[] = [];
    const otherSections: FormSection[] = [];
    const declarationsGroup: FormSection[] = [];

    page.sections.forEach((section) => {
      if (section.type === 'likertMatrix') {
        likertSections.push(section);
      } else if (section.type === 'textarea') {
        textareaSections.push(section);
      } else if (isDeclarationsGroup(section)) {
        declarationsGroup.push(section);
      } else {
        otherSections.push(section);
      }
    });

    // Match comments to Likert sections
    const getCommentForLikert = (likertTitle: string): FormSection | null => {
      const titleLower = likertTitle.toLowerCase();
      return textareaSections.find((textarea) => {
        const textareaLabel = (textarea.type === 'textarea' ? textarea.label : '').toLowerCase();
        if (titleLower.includes('logistics') && textareaLabel.includes('logistics')) return true;
        if (titleLower.includes('trainer/assessor') && textareaLabel.includes('training')) return true;
        if (titleLower.includes('learning') && textareaLabel.includes('learning')) return true;
        return false;
      }) || null;
    };

    // Add Likert sections with their comments
    likertSections.forEach((section) => {
      allLikertSections.push({
        section,
        comment: getCommentForLikert(section.title),
      });
    });

    // Store other sections and declarations by page
    if (otherSections.length > 0) {
      allOtherSections.push({ page, sections: otherSections });
    }
    if (declarationsGroup.length > 0) {
      allDeclarations.push({ page, sections: declarationsGroup });
    }
  });

  // Sort Likert sections: A → B → C
  const sortedLikertSections = [...allLikertSections].sort((a, b) => {
    const c1 = getSectionCode(a.section.title);
    const c2 = getSectionCode(b.section.title);
    return (SECTION_ORDER[c1] ?? 99) - (SECTION_ORDER[c2] ?? 99);
  });

  // Calculate total pages: other pages + Likert pages (one per section) + declarations page
  const totalPages =
    allOtherSections.length + sortedLikertSections.length + (allDeclarations.length > 0 ? 1 : 0);
  let currentPageNumber = 0;

  return (
    <Document>
      {/* Render other sections (details tables, etc.) */}
      {allOtherSections.map(({ sections }) => {
        currentPageNumber++;
        return (
          <Page key={`other-${currentPageNumber}`} size="A4" style={styles.page}>
            <PdfHeader />
            <View style={styles.content}>
              {sections.map((section, index) => (
                <PdfSectionRenderer
                  key={`other-${index}`}
                  section={section}
                  role={role}
                  answers={answers}
                  studentSignature={studentSignature}
                  trainerSignature={trainerSignature}
                />
              ))}
            </View>
            <PdfFooter 
              pageNumber={currentPageNumber} 
              totalPages={totalPages} 
              unitCode={answers['unit.code'] as string | undefined}
            />
          </Page>
        );
      })}

      {/* Render each Likert section on its own page with header and footer */}
      {sortedLikertSections.map(({ section, comment }) => {
        currentPageNumber++;
        return (
          <Page key={`likert-${section.title}-${currentPageNumber}`} size="A4" style={styles.page}>
            <PdfHeader />
            <View style={styles.content}>
              <PdfSectionRenderer
                section={section}
                role={role}
                answers={answers}
                studentSignature={studentSignature}
                trainerSignature={trainerSignature}
              />
              {comment && (
                <PdfSectionRenderer
                  section={comment}
                  role={role}
                  answers={answers}
                  studentSignature={studentSignature}
                  trainerSignature={trainerSignature}
                />
              )}
            </View>
            <PdfFooter 
              pageNumber={currentPageNumber} 
              totalPages={totalPages} 
              unitCode={answers['unit.code'] as string | undefined}
            />
          </Page>
        );
      })}

      {/* Render declarations on separate page */}
      {allDeclarations.map(({ sections }) => {
        currentPageNumber++;
        return (
          <Page key={`declarations-${currentPageNumber}`} size="A4" style={styles.page}>
            <PdfHeader />
            <View style={styles.content}>
              {sections.map((section, index) => (
                <PdfSectionRenderer
                  key={`declarations-${index}`}
                  section={section}
                  role={role}
                  answers={answers}
                  studentSignature={studentSignature}
                  trainerSignature={trainerSignature}
                />
              ))}
            </View>
            <PdfFooter 
              pageNumber={currentPageNumber} 
              totalPages={totalPages} 
              unitCode={answers['unit.code'] as string | undefined}
            />
          </Page>
        );
      })}
    </Document>
  );
};

