-- Dynamic assignment instructions: row_meta for task instructions, section-task linking

-- 1. Add row_meta to store rich-text instructions per assessment task row
ALTER TABLE skyline_form_question_rows ADD COLUMN IF NOT EXISTS row_meta JSONB DEFAULT '{}';

-- 2. Add assessment_task_row_id to link sections to specific tasks
ALTER TABLE skyline_form_sections ADD COLUMN IF NOT EXISTS assessment_task_row_id BIGINT REFERENCES skyline_form_question_rows(id) ON DELETE SET NULL;

-- 3. Add new pdf_render_mode values: task_instructions, task_questions, task_results
ALTER TABLE skyline_form_sections DROP CONSTRAINT IF EXISTS skyline_form_sections_pdf_render_mode_check;
ALTER TABLE skyline_form_sections ADD CONSTRAINT skyline_form_sections_pdf_render_mode_check
  CHECK (pdf_render_mode IN (
    'normal', 'likert_table', 'grid_table', 'declarations',
    'assessment_tasks', 'assessment_submission', 'reasonable_adjustment',
    'task_instructions', 'task_questions', 'task_results'
  ));
