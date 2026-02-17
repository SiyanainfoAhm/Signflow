-- Fix: Add 'assessment_summary' to pdf_render_mode constraint if missing
-- This migration ensures the constraint includes 'assessment_summary' even if previous migrations were run
ALTER TABLE skyline_form_sections DROP CONSTRAINT IF EXISTS skyline_form_sections_pdf_render_mode_check;
ALTER TABLE skyline_form_sections ADD CONSTRAINT skyline_form_sections_pdf_render_mode_check
  CHECK (pdf_render_mode IN (
    'normal', 'likert_table', 'grid_table', 'declarations',
    'assessment_tasks', 'assessment_submission', 'reasonable_adjustment',
    'task_instructions', 'task_questions', 'task_results',
    'assessment_summary'
  ));
