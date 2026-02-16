import { useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { cn } from '../utils/cn';

const QUILL_MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

const QUILL_FORMATS = [
  'header',
  'bold', 'italic', 'underline',
  'list', 'bullet',
  'link',
];

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  readOnly?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter content...',
  className,
  minHeight = '120px',
  readOnly = false,
}: RichTextEditorProps) {
  const modules = useMemo(() => QUILL_MODULES, []);

  return (
    <div className={cn('rich-text-editor', className)}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={(val: string) => onChange(val)}
        modules={modules}
        formats={QUILL_FORMATS}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{ minHeight }}
        className="[&_.ql-container]:min-h-[100px] [&_.ql-editor]:min-h-[100px]"
      />
    </div>
  );
}
