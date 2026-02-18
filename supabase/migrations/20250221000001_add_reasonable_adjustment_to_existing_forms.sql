-- Add Appendix A - Reasonable Adjustments step after Assessment Summary for forms that don't have it

INSERT INTO skyline_form_steps (form_id, title, subtitle, sort_order)
SELECT f.id,
  'Appendix A - Reasonable Adjustments',
  'Reasonable adjustment strategies and declaration',
  COALESCE((SELECT MAX(s.sort_order) + 1 FROM skyline_form_steps s WHERE s.form_id = f.id), 1)
FROM skyline_forms f
WHERE EXISTS (
  SELECT 1 FROM skyline_form_sections sec
  JOIN skyline_form_steps st ON st.id = sec.step_id
  WHERE st.form_id = f.id AND sec.pdf_render_mode = 'assessment_summary'
)
AND NOT EXISTS (
  SELECT 1 FROM skyline_form_sections sec
  JOIN skyline_form_steps st ON st.id = sec.step_id
  WHERE st.form_id = f.id AND sec.pdf_render_mode = 'reasonable_adjustment'
);

INSERT INTO skyline_form_sections (step_id, title, description, pdf_render_mode, sort_order)
SELECT st.id,
  'Reasonable Adjustment',
  'Students with carer responsibilities, cultural or religious obligations, English as an additional language, disability etc., can request reasonable adjustments. Academic standards will not be lowered; flexibility in delivery or assessment is required.',
  'reasonable_adjustment',
  0
FROM skyline_form_steps st
WHERE st.title = 'Appendix A - Reasonable Adjustments'
AND NOT EXISTS (
  SELECT 1 FROM skyline_form_sections sec
  WHERE sec.step_id = st.id AND sec.pdf_render_mode = 'reasonable_adjustment'
);

-- Add the four questions to each new Reasonable Adjustment section (sections with no questions yet)
INSERT INTO skyline_form_questions (section_id, type, code, label, required, sort_order, role_visibility, role_editability, pdf_meta)
SELECT sec.id, q.typ, q.code, q.lbl, false, q.ord, q.role_visibility, q.role_editability, q.pdf_meta
FROM skyline_form_sections sec
CROSS JOIN (
  VALUES
    (0, 'yes_no', 'reasonable_adjustment.applied', 'Was reasonable adjustment applied to any of these assessment tasks?', '{"student": true, "trainer": true, "office": true}'::jsonb, '{"student": false, "trainer": true, "office": false}'::jsonb, '{}'::jsonb),
    (1, 'short_text', 'reasonable_adjustment.task', 'Write (task name and number) where reasonable adjustments have been applied', '{"student": true, "trainer": true, "office": true}'::jsonb, '{"student": false, "trainer": true, "office": false}'::jsonb, '{}'::jsonb),
    (2, 'long_text', 'reasonable_adjustment.description', 'Provide a description of the adjustment applied and explain reasons.', '{"student": true, "trainer": true, "office": true}'::jsonb, '{"student": false, "trainer": true, "office": false}'::jsonb, '{}'::jsonb),
    (3, 'signature', 'trainer.reasonableAdjustmentSignature', 'Trainer/Assessor Signature', '{"student": true, "trainer": true, "office": true}'::jsonb, '{"student": false, "trainer": true, "office": false}'::jsonb, '{"showNameField": true, "showDateField": true}'::jsonb)
) AS q(ord, typ, code, lbl, role_visibility, role_editability, pdf_meta)
WHERE sec.pdf_render_mode = 'reasonable_adjustment'
AND NOT EXISTS (SELECT 1 FROM skyline_form_questions qq WHERE qq.section_id = sec.id);
