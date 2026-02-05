import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { TextareaSection } from '../../types/formDefinition';
import { Role, FormAnswers } from '../../types';
// Note: PDF shows all sections regardless of role permissions
import { FONT_FAMILY_PDF, ROW_HEIGHT, TABLE_BORDER } from '../../form/layout';

interface PdfTextareaProps {
  section: TextareaSection;
  role: Role;
  answers: FormAnswers;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderWidth: TABLE_BORDER,
    borderColor: '#000000',
  },
  labelRow: {
    height: 24,
    justifyContent: 'center',
    paddingLeft: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: TABLE_BORDER,
    borderBottomColor: '#000000',
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    fontFamily: FONT_FAMILY_PDF,
    color: '#111827',
  },
  box: {
    minHeight: ROW_HEIGHT * 6,
    padding: 10,
    backgroundColor: '#EEF3FF',
  },
  text: {
    fontSize: 10,
    fontFamily: FONT_FAMILY_PDF,
    color: '#111827',
    lineHeight: 1.2,
  },
});

export const PdfTextarea: React.FC<PdfTextareaProps> = ({ section, role: _role, answers }) => {
  // PDF shows all sections - no role filtering
  const value = answers[section.fieldId] || '';

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{section.label}</Text>
      </View>
      <View style={styles.box}>
        <Text style={styles.text}>{value}</Text>
      </View>
    </View>
  );
};

