import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { LikertMatrixSection } from '../../types/formDefinition';
import { Role, FormAnswers } from '../../types';
// Note: PDF shows all sections/questions regardless of role permissions
import { HEADER_BG, HEADER_TEXT, FONT_FAMILY_PDF } from '../../form/layout';

/**
 * IMPORTANT:
 * A4 width in react-pdf is ~595.28pt. If your Page has horizontal padding,
 * the table must fit inside the CONTENT width or it will clip/distort.
 *
 * Update PAGE_PADDING_X to match your <Page style={{ padding: ... }}>.
 */
const PAGE_WIDTH = 595.28; // A4 portrait width in points
const PAGE_PADDING_X = 48; // left+right padding total. (24*2). Change if your Page padding differs.
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_PADDING_X;

// Column widths (must SUM to CONTENT_WIDTH)
const COL_NO = 40;
const COL_LIKERT = 45;
const COL_CRITERIA = CONTENT_WIDTH - COL_NO - COL_LIKERT * 5;

// Heights & borders
const HEADER_H = 120;
const ROW_H = 28;
const BORDER = 1;

interface PdfLikertTableProps {
  section: LikertMatrixSection;
  role: Role;
  answers: FormAnswers;
}

const styles = StyleSheet.create({
  table: {
    width: CONTENT_WIDTH,
    borderWidth: BORDER,
    borderColor: '#000000',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderRightWidth: BORDER,
    borderRightColor: '#000000',
    borderBottomWidth: BORDER,
    borderBottomColor: '#000000',
    justifyContent: 'center',
  },
  cellNoBorderRight: {
    borderRightWidth: 0,
    borderBottomWidth: BORDER,
    borderBottomColor: '#000000',
    justifyContent: 'center',
  },
  headerText: {
    color: HEADER_TEXT,
    fontFamily: FONT_FAMILY_PDF,
    fontSize: 11,
    fontWeight: 700,
  },
  likertHeaderText: {
    fontSize: 9, // reduced
    fontWeight: 700,
    color: HEADER_TEXT,
    fontFamily: FONT_FAMILY_PDF,
    textAlign: 'center',
    width: HEADER_H, // critical so rotated word has room
    lineHeight: 1.0,
    // React-PDF transform syntax (string format for TS compatibility)
    transform: 'rotate(-90deg)',
  },
  criteriaText: {
    fontFamily: FONT_FAMILY_PDF,
    fontSize: 10,
    color: '#ffffff',
    lineHeight: 1.2,
  },
  bodyText: {
    fontFamily: FONT_FAMILY_PDF,
    fontSize: 10,
    color: '#000000',
  },
  radioOuter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#8A8A8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#8A8A8A',
  },
});

interface PdfCellProps {
  width: number;
  height?: number;
  backgroundColor?: string;
  isLast?: boolean;
  children?: React.ReactNode;
  alignItems?: 'center' | 'flex-start' | 'flex-end';
  justifyContent?: 'center' | 'flex-start' | 'flex-end';
  paddingLeft?: number;
  paddingTop?: number;
  paddingVertical?: number;
  paddingHorizontal?: number;
}

function PdfCell({
  width,
  height,
  backgroundColor,
  isLast = false,
  children,
  alignItems = 'center',
  justifyContent = 'center',
  paddingLeft,
  paddingTop,
  paddingVertical,
  paddingHorizontal,
}: PdfCellProps) {
  const cellStyle = isLast ? styles.cellNoBorderRight : styles.cell;

  return (
    <View
      style={[
        cellStyle,
        {
          width,
          height,
          backgroundColor,
          alignItems,
          justifyContent,
          paddingLeft,
          paddingTop,
          paddingVertical,
          paddingHorizontal,
        },
      ]}
    >
      {children}
    </View>
  );
}

function RotatedHeaderLabel({ label }: { label: string }) {
  return <Text style={styles.likertHeaderText}>{label}</Text>;
}

export const PdfLikertTable: React.FC<PdfLikertTableProps> = ({ section, role: _role, answers }) => {
  const scaleValues = [1, 2, 3, 4, 5];
  const scaleLabels =
    section.scaleLabels?.length === 5
      ? section.scaleLabels
      : ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

  const sectionCode = (() => {
    const t = section.title.toLowerCase();
    if (t.includes('logistics')) return 'A';
    if (t.includes('trainer/assessor')) return 'B';
    if (t.includes('learning')) return 'C';
    return '';
  })();

  return (
    <View style={styles.table}>
      {/* Header row */}
      <View style={[styles.row, { height: HEADER_H, backgroundColor: HEADER_BG }]}>
        {/* No. */}
        <PdfCell
          width={COL_NO}
          height={HEADER_H}
          backgroundColor={HEADER_BG}
          paddingTop={8}
          justifyContent="flex-start"
        >
          <Text style={styles.headerText}>No.</Text>
        </PdfCell>

        {/* Criteria/Question */}
        <PdfCell
          width={COL_CRITERIA}
          height={HEADER_H}
          backgroundColor={HEADER_BG}
          paddingTop={10}
          paddingLeft={10}
          alignItems="flex-start"
          justifyContent="flex-start"
        >
          <Text style={styles.headerText}>Criteria/Question</Text>
        </PdfCell>

        {/* Likert headers */}
        {scaleLabels.map((label, idx) => (
          <PdfCell
            key={label}
            width={COL_LIKERT}
            height={HEADER_H}
            backgroundColor={HEADER_BG}
            isLast={idx === scaleLabels.length - 1}
          >
            <RotatedHeaderLabel label={label} />
          </PdfCell>
        ))}
      </View>

      {/* Section row: MUST be 7 separate cells to keep vertical borders */}
      <View style={[styles.row, { height: ROW_H, backgroundColor: HEADER_BG }]}>
        <PdfCell width={COL_NO} height={ROW_H} backgroundColor={HEADER_BG}>
          <Text style={styles.headerText}>{sectionCode}</Text>
        </PdfCell>

        <PdfCell
          width={COL_CRITERIA}
          height={ROW_H}
          backgroundColor={HEADER_BG}
          paddingLeft={10}
          alignItems="flex-start"
        >
          <Text style={styles.headerText}>{section.title}</Text>
        </PdfCell>

        {scaleLabels.map((label, idx) => (
          <PdfCell
            key={`fill-${label}`}
            width={COL_LIKERT}
            height={ROW_H}
            backgroundColor={HEADER_BG}
            isLast={idx === scaleLabels.length - 1}
          />
        ))}
      </View>

      {/* Body rows - show all questions in PDF */}
      {section.questions.map((question, qIndex) => {
        const selectedValue = answers[question.fieldId];

        return (
          <View key={question.fieldId} style={[styles.row, { minHeight: ROW_H }]}>
            {/* No */}
            <PdfCell width={COL_NO} height={ROW_H}>
              <Text style={styles.bodyText}>{qIndex + 1}</Text>
            </PdfCell>

            {/* Criteria */}
            <PdfCell
              width={COL_CRITERIA}
              backgroundColor={HEADER_BG}
              paddingVertical={8}
              paddingHorizontal={10}
              alignItems="flex-start"
              justifyContent="flex-start"
            >
              <Text style={styles.criteriaText}>{question.question}</Text>
            </PdfCell>

            {/* Likert radios */}
            {scaleValues.map((value, idx) => {
              const isSelected = selectedValue === value;
              return (
                <PdfCell
                  key={`${question.fieldId}-${value}`}
                  width={COL_LIKERT}
                  isLast={idx === scaleValues.length - 1}
                >
                  <View style={styles.radioOuter}>{isSelected && <View style={styles.radioInner} />}</View>
                </PdfCell>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};
