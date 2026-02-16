-- Make qualification and unit questions read-only for all roles (student, trainer, office)
-- Admin sets these at form creation; other users should not edit them
UPDATE skyline_form_questions
SET role_editability = '{"student": false, "trainer": false, "office": false}'::jsonb
WHERE code IN ('qualification.code', 'qualification.name', 'unit.code', 'unit.name');
