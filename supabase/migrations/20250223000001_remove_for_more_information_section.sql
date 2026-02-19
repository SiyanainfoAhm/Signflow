-- Remove "For more information" section from Introductory Details in existing forms.
-- This section is no longer required; introduction ends at 19 (Special needs).

-- Delete in dependency order: answers, trainer_assessments, options, rows, questions, then section
DELETE FROM skyline_form_answers
WHERE question_id IN (
  SELECT q.id FROM skyline_form_questions q
  JOIN skyline_form_sections sec ON sec.id = q.section_id
  JOIN skyline_form_steps st ON st.id = sec.step_id
  WHERE sec.title = 'For more information' AND st.title = 'Introductory Details'
);

DELETE FROM skyline_form_trainer_assessments
WHERE question_id IN (
  SELECT q.id FROM skyline_form_questions q
  JOIN skyline_form_sections sec ON sec.id = q.section_id
  JOIN skyline_form_steps st ON st.id = sec.step_id
  WHERE sec.title = 'For more information' AND st.title = 'Introductory Details'
);

DELETE FROM skyline_form_question_options
WHERE question_id IN (
  SELECT q.id FROM skyline_form_questions q
  JOIN skyline_form_sections sec ON sec.id = q.section_id
  JOIN skyline_form_steps st ON st.id = sec.step_id
  WHERE sec.title = 'For more information' AND st.title = 'Introductory Details'
);

DELETE FROM skyline_form_question_rows
WHERE question_id IN (
  SELECT q.id FROM skyline_form_questions q
  JOIN skyline_form_sections sec ON sec.id = q.section_id
  JOIN skyline_form_steps st ON st.id = sec.step_id
  WHERE sec.title = 'For more information' AND st.title = 'Introductory Details'
);

DELETE FROM skyline_form_questions
WHERE section_id IN (
  SELECT sec.id FROM skyline_form_sections sec
  JOIN skyline_form_steps st ON st.id = sec.step_id
  WHERE sec.title = 'For more information' AND st.title = 'Introductory Details'
);

DELETE FROM skyline_form_sections
WHERE title = 'For more information'
AND step_id IN (SELECT id FROM skyline_form_steps WHERE title = 'Introductory Details');
