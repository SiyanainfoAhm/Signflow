import React, { useState, useEffect, useRef, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { PdfDocument } from '../pdf/PdfDocument';
import { useFormStore } from '../../store/formStore';
import { FormDefinition } from '../../types/formDefinition';
import { registerPdfFonts } from '../../utils/fontLoader';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  Download,
  Maximize2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import formDefinitionData from '../../data/formDefinition.json';

interface PremiumPdfPreviewCardProps {
  role: string;
}

export const PremiumPdfPreviewCard: React.FC<PremiumPdfPreviewCardProps> = ({ role }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(0.5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { answers, studentSignature, trainerSignature } = useFormStore();
  const formDefinition = formDefinitionData as FormDefinition;

  const generatePdf = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await registerPdfFonts();

      const doc = (
        <PdfDocument
          formDefinition={formDefinition}
          role={role as any}
          answers={answers}
          studentSignature={studentSignature}
          trainerSignature={trainerSignature}
        />
      );

      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();
      const url = URL.createObjectURL(blob);

      setPdfUrl((prevUrl) => {
        if (prevUrl) {
          URL.revokeObjectURL(prevUrl);
        }
        return url;
      });

      // Calculate total pages
      const likertSections = formDefinition.pages
        .flatMap((p) => p.sections)
        .filter((s) => s.type === 'likertMatrix').length;
      const hasDetailsPage = formDefinition.pages.some(
        (p) => p.pageNumber === 1 && p.sections.some((s) => s.type === 'detailsTable')
      );
      const hasDeclarationsPage = formDefinition.pages.some(
        (p) => p.sections.some((s) => s.type === 'checkboxGroup' || s.type === 'signatureBlock')
      );
      const total = (hasDetailsPage ? 1 : 0) + likertSections + (hasDeclarationsPage ? 1 : 0);
      setTotalPages(total);
    } catch (error) {
      console.error('Error generating PDF preview:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate PDF preview');
    } finally {
      setLoading(false);
    }
  }, [formDefinition, role, answers, studentSignature, trainerSignature]);

  // Debounced PDF generation
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      generatePdf();
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [generatePdf]);

  const handleDownload = async () => {
    if (!pdfUrl) {
      await generatePdf();
      return;
    }

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `training-evaluation-form-${role}-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFullscreen = () => {
    if (iframeRef.current?.requestFullscreen) {
      iframeRef.current.requestFullscreen();
    }
  };

  return (
    <Card className="overflow-hidden" padding="none">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--brand)] to-[#E06A0F] p-4">
        <h3 className="text-white font-bold text-base">Live PDF Preview</h3>
        <p className="text-orange-100 text-xs mt-0.5">Real-time preview of your form</p>
      </div>

      {/* Controls */}
      <div className="p-3 bg-gray-50 border-b border-[var(--border)] space-y-3">
        {/* Zoom and Page Controls */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
              disabled={zoom <= 0.25}
              className="p-1.5 h-8 w-8"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs font-medium text-gray-700 min-w-[50px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.min(1.5, zoom + 0.25))}
              disabled={zoom >= 1.5}
              className="p-1.5 h-8 w-8"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setZoom(0.5)} className="p-1.5 h-8 w-8">
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 h-8 w-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs font-medium text-gray-700 min-w-[60px] text-center">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 h-8 w-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="primary" onClick={handleDownload} size="sm" className="flex-1 flex items-center justify-center gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" />
            Download
          </Button>
          <Button variant="outline" onClick={handleFullscreen} size="sm" className="flex items-center gap-1.5 text-xs">
            <Maximize2 className="w-3.5 h-3.5" />
            Fullscreen
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="p-4 bg-[var(--bg)] h-[520px] flex items-center justify-center overflow-hidden">
        {loading ? (
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-[var(--brand)] animate-spin mx-auto mb-3" />
            <p className="text-gray-600 text-xs font-medium">Generating preview...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-600">
            <p className="text-xs font-medium mb-2">Error generating preview</p>
            <p className="text-[10px] text-red-400">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generatePdf()}
              className="mt-3"
            >
              Retry
            </Button>
          </div>
        ) : pdfUrl ? (
          <div className="w-full h-full flex justify-center items-center overflow-auto">
            <div className="bg-white p-2 rounded border border-[var(--border)] shadow-inner">
              <iframe
                ref={iframeRef}
                src={`${pdfUrl}#page=${currentPage}&zoom=${Math.round(zoom * 100)}`}
                className="border border-[var(--border)] rounded bg-white"
                style={{
                  width: `${595.28 * zoom}px`,
                  height: `${841.89 * zoom}px`,
                  maxWidth: '100%',
                }}
                title="PDF Preview"
              />
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p className="text-xs font-medium">Preview will appear here</p>
            <p className="text-[10px] mt-1.5 text-gray-400">Start filling the form to see live preview</p>
          </div>
        )}
      </div>
    </Card>
  );
};

