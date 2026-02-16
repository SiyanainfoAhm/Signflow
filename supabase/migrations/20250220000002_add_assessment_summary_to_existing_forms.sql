-- Add Assessment Summary step and section to existing forms that have task results
INSERT INTO skyline_form_steps (form_id, title, subtitle, sort_order)
SELECT f.id, 'Assessment Summary', 'Final record of student competency', COALESCE(
  (SELECT MAX(s.sort_order) + 1 FROM skyline_form_steps s WHERE s.form_id = f.id),
  1
)
FROM skyline_forms f
WHERE EXISTS (
  SELECT 1 FROM skyline_form_sections sec
  JOIN skyline_form_steps st ON st.id = sec.step_id
  WHERE st.form_id = f.id AND sec.pdf_render_mode = 'task_results'
)
AND NOT EXISTS (
  SELECT 1 FROM skyline_form_sections sec
  JOIN skyline_form_steps st ON st.id = sec.step_id
  WHERE st.form_id = f.id AND sec.pdf_render_mode = 'assessment_summary'
);

INSERT INTO skyline_form_sections (step_id, title, description, pdf_render_mode, sort_order)
SELECT st.id, 'Assessment Summary Sheet', NULL, 'assessment_summary', 0
FROM skyline_form_steps st
WHERE st.title = 'Assessment Summary'
AND NOT EXISTS (
  SELECT 1 FROM skyline_form_sections sec
  WHERE sec.step_id = st.id AND sec.pdf_render_mode = 'assessment_summary'
);
