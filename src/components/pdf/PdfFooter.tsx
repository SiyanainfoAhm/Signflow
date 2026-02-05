import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { FONT_FAMILY_PDF, PAGE_PADDING } from '../../form/layout';

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    left: PAGE_PADDING,
    right: PAGE_PADDING,
    bottom: PAGE_PADDING,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: FONT_FAMILY_PDF,
    fontSize: 9,
    color: '#111827',
  },
  center: {
    flexGrow: 1,
    textAlign: 'center',
  },
  left: {
    width: '33%',
    textAlign: 'left',
  },
  right: {
    width: '33%',
    textAlign: 'right',
  },
});

export const PdfFooter: React.FC<{ pageNumber: number; totalPages: number; unitCode?: string }> = ({
  pageNumber,
  totalPages,
  unitCode,
}) => {
  const displayUnitCode = unitCode || 'CPCCCM3001'; // Fallback to default if not provided

  return (
    <View style={styles.footer} fixed>
      <Text style={styles.left}>Version Number: 1</Text>
      <Text style={styles.center}>Unit Code: {displayUnitCode}</Text>
      <Text style={styles.right}>
        Page {pageNumber} of {totalPages}
      </Text>
    </View>
  );
};


