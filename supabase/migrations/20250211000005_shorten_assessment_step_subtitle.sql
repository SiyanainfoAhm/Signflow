-- Standardize Assessment Details step subtitle (used only for compulsory step)
UPDATE skyline_form_steps
SET subtitle = 'Student, trainer, qualification & assessment'
WHERE title = 'Assessment Details'
  AND subtitle IS DISTINCT FROM 'Student, trainer, qualification & assessment';
