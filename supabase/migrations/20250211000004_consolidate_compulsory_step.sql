-- Consolidate "Student & Trainer" and "Qualification & Unit" steps into a single compulsory step
-- for existing forms that still have the old two-step structure.

DO $$
DECLARE
  r RECORD;
  step_student_id BIGINT;
  step_qual_id BIGINT;
BEGIN
  FOR r IN
    SELECT f.id AS form_id
    FROM skyline_forms f
    WHERE EXISTS (
      SELECT 1 FROM skyline_form_steps s
      WHERE s.form_id = f.id AND s.title = 'Student & Trainer' AND s.sort_order = 0
    )
    AND EXISTS (
      SELECT 1 FROM skyline_form_steps s
      WHERE s.form_id = f.id AND s.title = 'Qualification & Unit' AND s.sort_order = 1
    )
  LOOP
    SELECT id INTO step_student_id FROM skyline_form_steps
    WHERE form_id = r.form_id AND title = 'Student & Trainer' AND sort_order = 0;

    SELECT id INTO step_qual_id FROM skyline_form_steps
    WHERE form_id = r.form_id AND title = 'Qualification & Unit' AND sort_order = 1;

    -- Move sections from Qualification step to Student step; renumber sort_order (0,1,2 -> 1,2,3)
    UPDATE skyline_form_sections
    SET step_id = step_student_id,
        sort_order = sort_order + 1
    WHERE step_id = step_qual_id;

    -- Update step title and subtitle
    UPDATE skyline_form_steps
    SET title = 'Assessment Details',
        subtitle = 'Student, trainer, qualification & assessment'
    WHERE id = step_student_id;

    -- Delete the Qualification & Unit step
    DELETE FROM skyline_form_steps WHERE id = step_qual_id;

    -- Decrement sort_order for steps that were after the deleted step
    UPDATE skyline_form_steps
    SET sort_order = sort_order - 1
    WHERE form_id = r.form_id AND sort_order > 1;
  END LOOP;
END $$;
