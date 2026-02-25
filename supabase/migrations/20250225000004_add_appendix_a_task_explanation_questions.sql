-- Add task and explanation questions to Appendix A sections that don't have them.
-- Appendix A (step "Appendix A - Reasonable Adjustments") needs:
-- 1. Write (task name and number) where reasonable adjustments have been applied
-- 2. Explanation of reasonable adjustments strategy used
-- 3. Trainer/Assessor Signature (usually already present)

-- Sections that need the task question (no task-related question yet)
INSERT INTO skyline_form_questions (section_id, type, code, label, required, sort_order, role_visibility, role_editability, pdf_meta)
SELECT sec.id, 'short_text', 'reasonable_adjustment_appendix.task', 'Write (task name and number) where reasonable adjustments have been applied', false, 0, '{"student": true, "trainer": true, "office": true}'::jsonb, '{"student": false, "trainer": true, "office": false}'::jsonb, '{}'::jsonb
FROM skyline_form_sections sec
JOIN skyline_form_steps st ON st.id = sec.step_id
WHERE st.title = 'Appendix A - Reasonable Adjustments'
  AND sec.pdf_render_mode = 'reasonable_adjustment'
  AND NOT EXISTS (
    SELECT 1 FROM skyline_form_questions q
    WHERE q.section_id = sec.id
      AND (q.code = 'reasonable_adjustment_appendix.task' OR (q.code = 'reasonable_adjustment.task' AND q.type = 'short_text'))
  );

-- Sections that need the explanation question (no explanation-related question yet)
INSERT INTO skyline_form_questions (section_id, type, code, label, required, sort_order, role_visibility, role_editability, pdf_meta)
SELECT sec.id, 'long_text', 'reasonable_adjustment_appendix.explanation', 'Explanation of reasonable adjustments strategy used', false, 1, '{"student": true, "trainer": true, "office": true}'::jsonb, '{"student": false, "trainer": true, "office": false}'::jsonb, '{}'::jsonb
FROM skyline_form_sections sec
JOIN skyline_form_steps st ON st.id = sec.step_id
WHERE st.title = 'Appendix A - Reasonable Adjustments'
  AND sec.pdf_render_mode = 'reasonable_adjustment'
  AND NOT EXISTS (
    SELECT 1 FROM skyline_form_questions q
    WHERE q.section_id = sec.id
      AND (q.code = 'reasonable_adjustment_appendix.explanation' OR q.code = 'reasonable_adjustment.description')
  );

-- Sections that need the matrix question (Reasonable Adjustment Strategies Matrix checkboxes)
INSERT INTO skyline_form_questions (section_id, type, code, label, required, sort_order, role_visibility, role_editability, pdf_meta)
SELECT sec.id, 'short_text', 'reasonable_adjustment_appendix.matrix', 'Reasonable Adjustment Strategies Matrix (select as applicable)', false, 2, '{"student": true, "trainer": true, "office": true}'::jsonb, '{"student": false, "trainer": true, "office": false}'::jsonb, '{"appendixMatrix": true}'::jsonb
FROM skyline_form_sections sec
JOIN skyline_form_steps st ON st.id = sec.step_id
WHERE st.title = 'Appendix A - Reasonable Adjustments'
  AND sec.pdf_render_mode = 'reasonable_adjustment'
  AND NOT EXISTS (
    SELECT 1 FROM skyline_form_questions q
    WHERE q.section_id = sec.id
      AND q.code = 'reasonable_adjustment_appendix.matrix'
  );
