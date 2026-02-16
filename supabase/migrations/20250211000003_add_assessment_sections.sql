-- Add assessment_tasks and assessment_submission to pdf_render_mode
ALTER TABLE skyline_form_sections DROP CONSTRAINT IF EXISTS skyline_form_sections_pdf_render_mode_check;
ALTER TABLE skyline_form_sections ADD CONSTRAINT skyline_form_sections_pdf_render_mode_check
  CHECK (pdf_render_mode IN ('normal', 'likert_table', 'grid_table', 'declarations', 'assessment_tasks', 'assessment_submission'));
