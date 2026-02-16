import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Edit2, X } from 'lucide-react';

interface SignaturePadProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  error?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  label,
  value,
  onChange,
  disabled,
  error,
}) => {
  const canvasRef = useRef<SignatureCanvas>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = () => {
    if (canvasRef.current && !canvasRef.current.isEmpty()) {
      const dataUrl = canvasRef.current.toDataURL('image/png', 1.0);
      onChange(dataUrl);
      setIsModalOpen(false);
    }
  };

  const handleClear = () => {
    if (canvasRef.current) canvasRef.current.clear();
  };

  const handleClearSignature = () => {
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-gray-700">
        {label}
        {error && <span className="text-red-600 ml-1">*</span>}
      </div>
      <div
        className="border-2 border-[var(--border)] rounded-lg bg-white min-h-[120px] flex items-center justify-center"
        style={{ minHeight: '120px' }}
      >
        {value ? (
          <div className="h-full flex items-center justify-center p-2">
            <div className="flex items-center gap-2">
              <img
                src={value}
                alt="Signature"
                className="h-12 w-auto rounded border border-[var(--border)]"
              />
              {!disabled && (
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSignature}
                    className="text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : disabled ? (
          <span className="text-gray-500 italic text-sm">No signature</span>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
            Add Signature
          </Button>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Sign Here" size="md">
        <div className="space-y-4">
          <div className="border-2 border-[var(--border)] rounded-lg overflow-hidden bg-white">
            <SignatureCanvas
              ref={canvasRef}
              canvasProps={{
                width: 600,
                height: 320,
                className: 'signature-canvas w-full',
              }}
              backgroundColor="#ffffff"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Signature
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
