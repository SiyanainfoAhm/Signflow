import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { TaskInstructionsModal, type TaskInstructionsData } from './TaskInstructionsModal';

interface SectionInstructionsEditorProps {
  section: { id: number; title: string; assessment_task_row_id?: number | null };
  onSaved?: () => void;
}

export function SectionInstructionsEditor({ section, onSaved }: SectionInstructionsEditorProps) {
  const [row, setRow] = useState<{ id: number; row_label: string; row_meta?: { instructions?: TaskInstructionsData } } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const rowId = (section as { assessment_task_row_id?: number | null }).assessment_task_row_id;

  useEffect(() => {
    if (!rowId) {
      setRow(null);
      return;
    }
    supabase
      .from('skyline_form_question_rows')
      .select('id, row_label, row_meta')
      .eq('id', rowId)
      .single()
      .then(({ data }) => setRow(data as typeof row));
  }, [rowId]);

  if (!rowId) {
    return (
      <Card>
        <p className="text-sm text-amber-700">Link this section to a task in the Sections panel (use the &quot;Link to task&quot; dropdown).</p>
      </Card>
    );
  }

  const handleSave = async (data: TaskInstructionsData) => {
    if (!rowId) return;
    await supabase
      .from('skyline_form_question_rows')
      .update({ row_meta: { instructions: data } })
      .eq('id', rowId);
    setRow((prev) => (prev ? { ...prev, row_meta: { instructions: data } } : null));
    setModalOpen(false);
    onSaved?.();
  };

  return (
    <Card>
      <h3 className="font-bold mb-2">Student instructions</h3>
      <p className="text-sm text-gray-600 mb-4">
        Add the instructions students will read before completing this assessment task. Use bullet points, headings, and formatting as needed.
      </p>
      <Button variant="primary" onClick={() => setModalOpen(true)}>
        {row?.row_meta?.instructions ? 'Edit instructions' : 'Add instructions'}
      </Button>
      {modalOpen && row && (
        <TaskInstructionsModal
          isOpen
          onClose={() => setModalOpen(false)}
          rowLabel={row.row_label}
          initialData={row.row_meta?.instructions}
          onSave={handleSave}
        />
      )}
    </Card>
  );
}
