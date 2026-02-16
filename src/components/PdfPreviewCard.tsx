import React, { useState, useCallback } from 'react';
import { exportPdf } from '../utils/pdfExport';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Download } from 'lucide-react';
import { Loader } from './ui/Loader';
import { Role } from '../types';

interface PdfPreviewCardProps {
  role: Role;
}

export const PdfPreviewCard: React.FC<PdfPreviewCardProps> = ({ role }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = useCallback(async () => {
    setIsGenerating(true);
    try {
      await exportPdf(role);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [role]);

  return (
    <Card className="sticky top-6 h-[560px] flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h3 className="text-lg font-bold text-[var(--text)]">PDF Preview</h3>
          <p className="text-xs text-gray-500 mt-1">Live preview of your form</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-white rounded-lg border border-slate-200 mb-4 overflow-hidden">
        <div className="text-center p-8">
          <div className="w-24 h-32 mx-auto mb-4 bg-white border-2 border-slate-300 rounded shadow-sm flex items-center justify-center">
            <div className="text-slate-400 text-xs">PDF</div>
          </div>
          <p className="text-sm text-gray-600 font-medium mb-1">Preview will appear here</p>
          <p className="text-xs text-gray-400">Fill the form to see live preview</p>
        </div>
      </div>

      <Button
        variant="primary"
        onClick={handleDownload}
        disabled={isGenerating}
        className="w-full flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <Loader variant="dots" size="sm" inline className="mr-2" />
            Generating...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Download PDF
          </>
        )}
      </Button>
    </Card>
  );
};

