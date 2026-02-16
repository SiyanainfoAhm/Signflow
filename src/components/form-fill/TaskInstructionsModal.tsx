import { useState, useEffect } from 'react';
import { RichTextEditor } from '../ui/RichTextEditor';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';

export interface TaskInstructionsData {
  assessment_type?: string;
  task_description?: string;
  applicable_conditions?: string;
  resubmissions?: string;
  location_intro?: string;
  location_options?: string[];
  location_note?: string;
  answering_instructions?: string;
  purpose_intro?: string;
  purpose_bullets?: string;
  task_instructions?: string;
}

const DEFAULT_INSTRUCTIONS: TaskInstructionsData = {
  assessment_type: '<p>Written Questions</p>',
  task_description: '<ul><li>This is the first (1) assessment task</li><li>It comprises five (5) written questions</li><li>You must respond to all questions and submit them to your Trainer/Assessor</li><li>Answers must be to the required level (e.g. word limit)</li><li>Feedback will be received within two (2) weeks</li></ul>',
  applicable_conditions: '<ul><li>All knowledge tests are untimed and are conducted as open book assessment</li><li>You must read and respond to all questions</li><li>You may handwrite/use a computer to answer the questions</li><li>You must complete the task independently</li><li>No marks or grades are allocated; outcome is Satisfactory or Not Satisfactory</li></ul>',
  resubmissions: '<ul><li>Resubmission attempt will be allowed if answers are not satisfactory after the first attempt</li><li>You may speak to your trainer/assessor for difficulty or reasonable adjustments</li><li>Refer to the Training Organisation\'s Student Handbook for more information</li></ul>',
  location_intro: '<p>This assessment task may be completed in:</p>',
  location_options: ['a classroom', 'learning management system (e.g. Moodle)', 'workplace', 'an independent learning environment'],
  location_note: '<p>Your trainer/assessor will provide further information regarding the location.</p>',
  answering_instructions: '<ul><li>Complete all questions correctly</li><li>Read questions carefully before answering</li><li>Demonstrate understanding and critical thinking</li><li>Be concise and adhere to word limits</li><li>Use your own words</li><li>Use non-discriminatory language</li><li>Acknowledge sources when quoting or paraphrasing</li></ul>',
  purpose_intro: '<p>This assessment task is designed to evaluate student\'s knowledge essential to the unit of competency.</p>',
  purpose_bullets: '<ul><li>Relevant terminology and definitions</li><li>Job safety analyses</li><li>Relevant laws and regulations</li><li>Quality requirements</li><li>Statutory and authority requirements</li></ul>',
  task_instructions: '<ul><li>This is an individual assessment.</li><li>To ensure your responses are satisfactory, consult a range of learning resources.</li><li>To be assessed as Satisfactory in this assessment task all questions must be answered correctly.</li></ul>',
};

interface TaskInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rowLabel: string;
  initialData?: TaskInstructionsData | null;
  onSave: (data: TaskInstructionsData) => void;
}

export function TaskInstructionsModal({
  isOpen,
  onClose,
  rowLabel,
  initialData,
  onSave,
}: TaskInstructionsModalProps) {
  const [data, setData] = useState<TaskInstructionsData>({ ...DEFAULT_INSTRUCTIONS });

  useEffect(() => {
    if (isOpen) {
      const merged = { ...DEFAULT_INSTRUCTIONS, ...initialData };
      setData(merged);
    }
  }, [isOpen, initialData]);

  const update = (key: keyof TaskInstructionsData, value: string | string[]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit instructions: {rowLabel}</h2>
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assessment type</label>
            <RichTextEditor value={data.assessment_type || ''} onChange={(v) => update('assessment_type', v)} minHeight="60px" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions provided to the student</label>
            <RichTextEditor value={data.task_description || ''} onChange={(v) => update('task_description', v)} placeholder="Bullet points for task description..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Applicable conditions</label>
            <RichTextEditor value={data.applicable_conditions || ''} onChange={(v) => update('applicable_conditions', v)} placeholder="Bullet points for conditions..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resubmissions and reattempts</label>
            <RichTextEditor value={data.resubmissions || ''} onChange={(v) => update('resubmissions', v)} placeholder="Bullet points for resubmission policy..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location – intro text</label>
            <RichTextEditor value={data.location_intro || ''} onChange={(v) => update('location_intro', v)} minHeight="60px" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location – options (one per line)</label>
            <Textarea
              value={(data.location_options || []).join('\n')}
              onChange={(e) => update('location_options', e.target.value.split('\n').filter(Boolean))}
              placeholder="a classroom&#10;workplace&#10;..."
              rows={4}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Enter each option on a new line</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location – note</label>
            <RichTextEditor value={data.location_note || ''} onChange={(v) => update('location_note', v)} minHeight="60px" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions for answering the written questions</label>
            <RichTextEditor value={data.answering_instructions || ''} onChange={(v) => update('answering_instructions', v)} placeholder="Bullet points for answering instructions..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of the assessment – intro</label>
            <RichTextEditor value={data.purpose_intro || ''} onChange={(v) => update('purpose_intro', v)} minHeight="60px" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of the assessment – bullet points</label>
            <RichTextEditor value={data.purpose_bullets || ''} onChange={(v) => update('purpose_bullets', v)} placeholder="Bullet points for knowledge areas..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task instructions (short bullet list)</label>
            <RichTextEditor value={data.task_instructions || ''} onChange={(v) => update('task_instructions', v)} placeholder="Bullet points for task instructions..." />
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save instructions</Button>
        </div>
      </div>
    </div>
  );
}
