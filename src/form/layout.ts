// Shared layout constants for Web + PDF renderers.
// Goal: identical printable-form geometry with no scaling surprises.

// Page (A4) in points (react-pdf uses points)
export const A4_WIDTH_PT = 595.28;
export const A4_HEIGHT_PT = 841.89;

// Requested constants (treat these as the "source" widths in px-like units)
export const PAGE_WIDTH_MM = 210;
export const PAGE_PADDING = 24; // pt for PDF, px for web-ish spacing

export const TABLE_BORDER = 1;
export const HEADER_BG = '#6D6D6D';
export const HEADER_TEXT = '#FFFFFF';

export const FONT_FAMILY_WEB = 'Arial, Helvetica, sans-serif';
export const FONT_FAMILY_PDF = 'Helvetica';

export const FONT_BODY = 10;
export const FONT_HEAD = 11;

export const ROW_HEIGHT = 22;
export const HEADER_HEIGHT = 110;

export const COLUMN_WIDTHS = {
  no: 50,
  criteria: 330,
  likert: 55, // each (5 columns)
} as const;

export const TOTAL_TABLE_WIDTH =
  COLUMN_WIDTHS.no + COLUMN_WIDTHS.criteria + COLUMN_WIDTHS.likert * 5;

export function getPdfContentWidthPt(): number {
  return A4_WIDTH_PT - PAGE_PADDING * 2;
}

// Scale the requested column widths to fit inside the PDF content box.
// This avoids any renderer auto-shrinking (distortion) while keeping consistent proportions.
export function getPdfTableScale(): number {
  return getPdfContentWidthPt() / TOTAL_TABLE_WIDTH;
}

export function pdfPx(px: number): number {
  return px * getPdfTableScale();
}

export const PDF_COL_WIDTHS = {
  no: pdfPx(COLUMN_WIDTHS.no),
  criteria: pdfPx(COLUMN_WIDTHS.criteria),
  likert: pdfPx(COLUMN_WIDTHS.likert),
  table: pdfPx(TOTAL_TABLE_WIDTH),
} as const;


