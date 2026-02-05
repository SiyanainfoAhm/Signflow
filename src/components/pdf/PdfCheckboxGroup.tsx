import React from 'react';
import { View, Text, StyleSheet, Svg, Path } from '@react-pdf/renderer';
import { CheckboxGroupSection } from '../../types/formDefinition';
import { Role, FormAnswers } from '../../types';
// Note: PDF shows all sections/options regardless of role permissions

interface PdfCheckboxGroupProps {
  section: CheckboxGroupSection;
  role: Role;
  answers: FormAnswers;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#ffffff',
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
  option: {
    flexDirection: 'row',
    marginBottom: 6,
    fontSize: 10,
    alignItems: 'flex-start',
    paddingVertical: 4,
    fontFamily: 'Inter',
  },
  checkboxBox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: '#6b7280',
    marginRight: 8,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  checkmarkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
});

export const PdfCheckboxGroup: React.FC<PdfCheckboxGroupProps> = ({ section, role: _role, answers }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{section.title}</Text>
      {section.options.map((option) => {
        // PDF shows all options - no role filtering
        const checked = answers[option.fieldId] || false;
        return (
          <View key={option.fieldId} style={styles.option}>
            {/* Draw actual checkbox box */}
            <View style={styles.checkboxBox}>
              {checked && (
                <View style={styles.checkmarkContainer}>
                  {/* SVG checkmark so it works regardless of font glyph support */}
                  <Svg width={10} height={10} viewBox="0 0 12 12">
                    <Path
                      d="M1.5 6.5 L4.5 9.5 L10.5 2.5"
                      stroke="#111827"
                      strokeWidth={1.8}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
              )}
            </View>
            <View style={{ flex: 1, paddingLeft: 8 }}>
              <Text style={{ fontFamily: 'Inter' }}>{option.label}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

