-- Assessment Submission Method: always editable by trainer (not student/office)
UPDATE skyline_form_questions
SET role_editability = '{"student": false, "trainer": true, "office": false}'::jsonb
WHERE code IN ('assessment.submission', 'assessment.otherDesc');
