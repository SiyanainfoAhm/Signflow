import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { DetailsTableSection } from '../../types/formDefinition';
import { Role, FormAnswers } from '../../types';
// Note: PDF shows all sections/fields regardless of role permissions

interface PdfDetailsTableProps {
  section: DetailsTableSection;
  role: Role;
  answers: FormAnswers;
}

const styles = StyleSheet.create({
  table: {
    width: '100%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
    borderLeftWidth: 4,
    borderLeftColor: '#f97316',
    paddingLeft: 8,
    fontFamily: 'Inter',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerRow: {
    backgroundColor: '#374151',
  },
  cell: {
    padding: 10,
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    fontFamily: 'Inter',
  },
  headerCell: {
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'Inter',
  },
  fieldCell: {
    width: '40%',
    backgroundColor: '#f9fafb',
    fontWeight: 'semibold',
    color: '#374151',
    fontFamily: 'Inter',
  },
  valueCell: {
    width: '60%',
    color: '#1f2937',
    fontFamily: 'Inter',
  },
  dataRow: {
    backgroundColor: '#ffffff',
  },
  dataRowAlt: {
    backgroundColor: '#f9fafb',
  },
  subSectionHeader: {
    backgroundColor: '#4b5563',
  },
  subSectionHeaderCell: {
    fontWeight: 'bold',
    color: '#ffffff',
    fontSize: 11,
    fontFamily: 'Inter',
  },
});

export const PdfDetailsTable: React.FC<PdfDetailsTableProps> = ({ section, role: _role, answers }) => {
  // Group fields by prefix to create sub-sections
  const groupFields = () => {
    const groups: { [key: string]: typeof section.fields } = {};
    
    section.fields.forEach((field) => {
      const prefix = field.fieldId.split('.')[0];
      const groupKey = prefix === 'student' ? 'Student details' :
                       prefix === 'trainer' ? 'Trainer details' :
                       prefix === 'qualification' ? 'Qualification/Course/Program Details' :
                       prefix === 'unit' ? 'Unit of competency' :
                       prefix === 'office' ? 'Office Use Only' : 'Other';
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(field);
    });
    
    return groups;
  };

  const fieldGroups = groupFields();
  let globalIdx = 0;

  return (
    <View style={styles.table}>
      <Text style={styles.title}>{section.title}</Text>
      {Object.entries(fieldGroups).map(([groupName, fields]) => (
        <React.Fragment key={groupName}>
          {/* Sub-section header row */}
          <View style={[styles.row, styles.subSectionHeader]}>
            <Text style={[styles.cell, styles.subSectionHeaderCell, { width: '100%' }]}>{groupName}</Text>
          </View>
          {/* Fields in this group - PDF shows all fields */}
          {fields.map((field) => {
            // PDF shows all fields - no role filtering
            const value = answers[field.fieldId] || '';
            const idx = globalIdx++;
            return (
              <View key={field.fieldId} style={[styles.row, idx % 2 === 0 ? styles.dataRow : styles.dataRowAlt]}>
                <Text style={[styles.cell, styles.fieldCell, idx % 2 === 0 ? styles.dataRow : styles.dataRowAlt]}>{field.label}</Text>
                <Text style={[styles.cell, styles.valueCell, idx % 2 === 0 ? styles.dataRow : styles.dataRowAlt]}>{String(value)}</Text>
              </View>
            );
          })}
        </React.Fragment>
      ))}
    </View>
  );
};

