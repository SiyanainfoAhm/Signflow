import React, { useState, useEffect, useRef } from 'react';
import { pdf } from '@react-pdf/renderer';
import { PdfDocument } from '../pdf/PdfDocument';
import { useFormStore } from '../../store/formStore';
import { FormDefinition } from '../../types/formDefinition';
import { registerPdfFonts } from '../../utils/fontLoader';
import { Loader } from '../ui/Loader';
import formDefinitionData from '../../data/formDefinition.json';

interface PdfPreviewCardProps {
  role: string;
}

export const PdfPreviewCard: React.FC<PdfPreviewCardProps> = ({ role }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(0.5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { answers, studentSignature, trainerSignature } = useFormStore();
  const formDefinition = formDefinitionData as FormDefinition;

  // Debounced PDF generation
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      await generatePdf();
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [answers, studentSignature, trainerSignature, role]);

  const generatePdf = async () => {
    setLoading(true);
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

      // Clean up old URL
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      setPdfUrl(url);
      // Calculate total pages based on PdfDocument structure:
      // - 1 page for details tables (page 1)
      // - 3 pages for Likert sections (A, B, C - one each)
      // - 1 page for declarations
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
    } finally {
      setLoading(false);
    }
  };

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
    <div className="sticky top-4 bg-white rounded-xl shadow-xl border-2 border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-4">
        <h3 className="text-white font-bold text-lg">PDF Preview</h3>
        <p className="text-orange-100 text-xs mt-1">Live preview of your form</p>
      </div>

      {/* Controls */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
              disabled={zoom <= 0.25}
            >
              −
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(1.5, zoom + 0.25))}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
              disabled={zoom >= 1.5}
            >
              +
            </button>
            <button
              onClick={() => setZoom(0.5)}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ←
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[80px] text-center">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleDownload}
            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold text-sm transition-all shadow-sm hover:shadow-md"
          >
            Download PDF
          </button>
          <button
            onClick={handleFullscreen}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold text-sm transition-all"
          >
            Fullscreen
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="p-2 md:p-4 bg-gray-100 min-h-[400px] md:min-h-[600px] flex items-center justify-center">
        {loading ? (
          <div className="text-center">
            <Loader variant="dots" size="lg" message="Generating preview..." />
          </div>
        ) : pdfUrl ? (
          <div className="w-full flex justify-center">
            <iframe
              ref={iframeRef}
              src={`${pdfUrl}#page=${currentPage}&zoom=${Math.round(zoom * 100)}`}
              className="border-2 border-gray-300 rounded-lg shadow-lg bg-white"
              style={{
                width: `${595.28 * zoom}px`,
                height: `${841.89 * zoom}px`,
                maxWidth: '100%',
                maxHeight: '70vh',
              }}
            />
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p className="text-sm">Preview will appear here</p>
            <p className="text-xs mt-2">Start filling the form to see live preview</p>
          </div>
        )}
      </div>
    </div>
  );
};

