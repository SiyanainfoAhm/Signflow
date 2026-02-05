import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { PdfLogo } from './PdfLogo';
import { HEADER_TEXT, FONT_FAMILY_PDF, PAGE_PADDING } from '../../form/layout';

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: PAGE_PADDING,
    left: PAGE_PADDING,
    right: PAGE_PADDING,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 10,
  },
  left: {
    width: '20%',
  },
  center: {
    width: '55%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
  },
  right: {
    width: '25%',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    fontFamily: FONT_FAMILY_PDF,
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.35,
  },
  logoBox: {
    width: 120,
    height: 70,
    justifyContent: 'center',
  },
  orgMain: {
    fontSize: 34,
    fontWeight: 700,
    color: '#f97316',
    letterSpacing: 2,
    fontFamily: 'Montserrat',
    lineHeight: 1,
  },
  orgSub: {
    marginTop: 2,
    fontSize: 11,
    letterSpacing: 3,
    color: '#374151',
    fontFamily: 'Montserrat',
    lineHeight: 1.1,
  },
  divider: {
    position: 'absolute',
    left: PAGE_PADDING,
    right: PAGE_PADDING,
    top: PAGE_PADDING + 80,
    height: 1,
    backgroundColor: '#9ca3af',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'underline',
  },
  textWhite: {
    color: HEADER_TEXT,
  },
});

export const PdfHeader: React.FC = () => {
  return (
    <>
      <View style={styles.header} fixed>
        <View style={styles.left}>
          <View style={styles.logoBox}>
            <PdfLogo width={120} height={70} />
          </View>
        </View>
        <View style={styles.center}>
          <Text style={styles.orgMain}>SKYLINE</Text>
          <Text style={styles.orgSub}>INSTITUTE OF TECHNOLOGY</Text>
        </View>
        <View style={styles.right}>
          <Text>Level 8</Text>
          <Text>310 King Street</Text>
          <Text>Melbourne VIC - 3000</Text>
          <Text>RTO: 45989 CRICOS: 04114B</Text>
          <Text style={styles.link}>Email: info@slit.edu.au</Text>
          <Text>Phone: +61 3 9125 1661</Text>
        </View>
      </View>
      <View style={styles.divider} fixed />
    </>
  );
};


