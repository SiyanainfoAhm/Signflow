import React from 'react';
import { View, Image, Svg, Path, Rect, Text as SvgText, Circle } from '@react-pdf/renderer';
import { LOGO_BASE64, LOGO_MIME_TYPE } from '../../utils/logoBase64';

export const PdfLogo: React.FC<{ width?: number; height?: number }> = ({ width = 80, height = 96 }) => {
  // Use the actual logo image from public/logo.jpg (converted to base64)
  // Run: npm run convert-logo to regenerate if logo changes
  if (LOGO_BASE64) {
    return (
      <View style={{ width, height }}>
        <Image
          src={`data:${LOGO_MIME_TYPE};base64,${LOGO_BASE64}`}
          style={{ width, height }}
        />
      </View>
    );
  }

  // Otherwise, use SVG version (always works)
  return (
    <View style={{ width, height }}>
      <Svg viewBox="0 0 200 240" width={width} height={height}>
        {/* Shield outline */}
        <Path
          d="M100 10 L180 40 L180 140 Q180 200 100 230 Q20 200 20 140 L20 40 Z"
          fill="#363636"
          stroke="#f97316"
          strokeWidth="3"
        />
        
        {/* Graduation cap */}
        <Circle cx="100" cy="60" r="8" fill="#f97316" />
        <Path
          d="M85 60 L100 50 L115 60 L100 70 Z"
          fill="#f97316"
        />
        
        {/* Wings/Book shape */}
        <Path
          d="M80 75 Q100 85 120 75"
          stroke="#b0b0b0"
          strokeWidth="2"
          fill="none"
        />
        <Path
          d="M75 90 Q100 100 125 90"
          stroke="#b0b0b0"
          strokeWidth="2"
          fill="none"
        />
        
        {/* Laurel wreaths */}
        <Path
          d="M50 70 Q60 50 70 60 Q65 75 60 85"
          stroke="#f97316"
          strokeWidth="2.5"
          fill="none"
        />
        <Path
          d="M150 70 Q140 50 130 60 Q135 75 140 85"
          stroke="#f97316"
          strokeWidth="2.5"
          fill="none"
        />
        
        {/* SKYLINE banner */}
        <Rect x="30" y="120" width="140" height="25" fill="#f97316" rx="2" />
        <SvgText
          x="100"
          y="137"
          textAnchor="middle"
          fill="white"
          style={{ fontSize: 18, fontWeight: 'bold', fontFamily: 'Helvetica-Bold' }}
        >
          SKYLINE
        </SvgText>
        
        {/* INSTITUTE OF TECHNOLOGY text */}
        <SvgText
          x="100"
          y="155"
          textAnchor="middle"
          fill="white"
          style={{ fontSize: 8, fontFamily: 'Helvetica' }}
        >
          INSTITUTE OF TECHNOLOGY
        </SvgText>
        
        {/* KNOWLEDGE IS ENDLESS banner */}
        <Rect x="40" y="190" width="120" height="20" fill="#f97316" rx="2" />
        <SvgText
          x="100"
          y="204"
          textAnchor="middle"
          fill="white"
          style={{ fontSize: 9, fontFamily: 'Helvetica' }}
        >
          KNOWLEDGE IS ENDLESS
        </SvgText>
        
        {/* Stars */}
        <Circle cx="90" cy="215" r="2" fill="#f97316" />
        <Circle cx="100" cy="215" r="2.5" fill="#f97316" />
        <Circle cx="110" cy="215" r="2" fill="#f97316" />
        <Circle cx="85" cy="215" r="1" fill="white" opacity="0.5" />
        <Circle cx="115" cy="215" r="1" fill="white" opacity="0.5" />
      </Svg>
    </View>
  );
};
