import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { LikertMatrixSection } from '../../types/formDefinition';
import { Role, FormAnswers } from '../../types';
import { canViewField } from '../../utils/roleUtils';

interface PdfLikertMatrixProps {
  section: LikertMatrixSection;
  role: Role;
  answers: FormAnswers;
}

const styles = StyleSheet.create({
  table: {
    width: '100%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#000000',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  cellBox: {
    borderRightWidth: 1,
    borderRightColor: '#000000',
    justifyContent: 'center',
  },
  cellBoxLast: {
    borderRightWidth: 0,
  },
  headerRow: {
    backgroundColor: '#6D6D6D',
    height: 120,
  },
  headerNo: {
    width: 55,
    backgroundColor: '#6D6D6D',
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Helvetica',
    textAlign: 'center',
    paddingTop: 8,
  },
  headerCriteria: {
    flexGrow: 1,
    flexBasis: 0,
    backgroundColor: '#6D6D6D',
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Helvetica',
    textAlign: 'left',
    paddingTop: 10,
    paddingLeft: 10,
  },
  headerScale: {
    width: 70,
    backgroundColor: '#6D6D6D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verticalLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Helvetica',
    transform: 'rotate(-90deg)',
  },
  sectionRow: {
    backgroundColor: '#6D6D6D',
    height: 28,
  },
  sectionCodeCell: {
    width: 55,
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Helvetica',
    textAlign: 'center',
    justifyContent: 'center',
  },
  sectionTitleCell: {
    flexGrow: 1,
    flexBasis: 0,
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Helvetica',
    textAlign: 'left',
    justifyContent: 'center',
    paddingLeft: 10,
  },
  bodyRow: {
    minHeight: 20,
  },
  bodyNoCell: {
    width: 55,
    backgroundColor: '#ffffff',
    color: '#000000',
    fontSize: 10,
    fontFamily: 'Helvetica',
    textAlign: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  bodyCriteriaCell: {
    flexGrow: 1,
    flexBasis: 0,
    backgroundColor: '#6D6D6D',
    color: '#ffffff',
    fontSize: 9.5,
    fontFamily: 'Helvetica',
    textAlign: 'left',
    paddingVertical: 3,
    paddingHorizontal: 10,
    lineHeight: 1.2,
    justifyContent: 'center',
  },
  bodyRadioCell: {
    width: 70,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#8A8A8A',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  radioInnerCircle: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#8A8A8A',
  },
});

export const PdfLikertMatrix: React.FC<PdfLikertMatrixProps> = ({ section, role, answers }) => {
  const scaleValues = [1, 2, 3, 4, 5];
  const scaleLabels =
    section.scaleLabels?.length === 5
      ? section.scaleLabels
      : ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

  const sectionCode = (() => {
    const t = section.title.toLowerCase();
    if (t.includes('trainer/assessor')) return 'B';
    if (t.includes('learning')) return 'A';
    return '';
  })();

  return (
    <View style={styles.table}>
      <View style={[styles.row, styles.headerRow]}>
        <View style={[styles.cellBox, { width: 55 }]}>
          <Text style={styles.headerNo}>No.</Text>
        </View>
        <View style={[styles.cellBox, { flexGrow: 1, flexBasis: 0 }]}>
          <Text style={styles.headerCriteria}>Criteria/Question</Text>
        </View>
        {scaleLabels.map((label, idx) => (
          <View
            key={label}
            style={[
              styles.cellBox,
              styles.headerScale,
              idx === scaleLabels.length - 1 ? styles.cellBoxLast : {},
            ]}
          >
            <Text style={styles.verticalLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.row, styles.sectionRow]}>
        <View style={[styles.cellBox, { width: 55 }]}>
          <Text style={styles.sectionCodeCell}>{sectionCode}</Text>
        </View>
        <View style={[styles.cellBox, { flexGrow: 1, flexBasis: 0 }]}>
          <Text style={styles.sectionTitleCell}>{section.title}</Text>
        </View>
        {scaleLabels.map((label, idx) => (
          <View
            key={`section-fill-${label}`}
            style={[
              styles.cellBox,
              { width: 70, backgroundColor: '#6D6D6D' },
              idx === scaleLabels.length - 1 ? styles.cellBoxLast : {},
            ]}
          />
        ))}
      </View>

      {section.questions.map((question, qIndex) => {
        if (!canViewField(role, question.roleScope)) return null;
        const selectedValue = answers[question.fieldId];
        return (
          <View key={question.fieldId} style={[styles.row, styles.bodyRow]}>
            <View style={[styles.cellBox, { width: 55 }]}>
              <Text style={styles.bodyNoCell}>{qIndex + 1}</Text>
            </View>
            <View style={[styles.cellBox, { flexGrow: 1, flexBasis: 0 }]}>
              <Text style={styles.bodyCriteriaCell}>{question.question}</Text>
            </View>
            {scaleValues.map((value) => {
              const isSelected = selectedValue === value;
              const isLast = value === scaleValues[scaleValues.length - 1];
              return (
                <View
                  key={value}
                  style={[styles.cellBox, styles.bodyRadioCell, isLast ? styles.cellBoxLast : {}]}
                >
                  <View style={styles.radioCircle}>
                    {isSelected && <View style={styles.radioInnerCircle} />}
                  </View>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};

