-- Add Learner Evaluation step after Appendix A for forms that don't have it

INSERT INTO skyline_form_steps (form_id, title, subtitle, sort_order)
SELECT f.id,
  'Learner Evaluation',
  'Training evaluation and feedback',
  COALESCE((SELECT MAX(s.sort_order) + 1 FROM skyline_form_steps s WHERE s.form_id = f.id), 1)
FROM skyline_forms f
WHERE EXISTS (
  SELECT 1 FROM skyline_form_sections sec
  JOIN skyline_form_steps st ON st.id = sec.step_id
  WHERE st.form_id = f.id AND sec.pdf_render_mode = 'reasonable_adjustment'
)
AND NOT EXISTS (
  SELECT 1 FROM skyline_form_steps st
  WHERE st.form_id = f.id AND st.title = 'Learner Evaluation'
);

-- Participant Information Section
INSERT INTO skyline_form_sections (step_id, title, description, pdf_render_mode, sort_order)
SELECT st.id,
  'Participant Information',
  NULL,
  'normal',
  0
FROM skyline_form_steps st
WHERE st.title = 'Learner Evaluation'
AND NOT EXISTS (
  SELECT 1 FROM skyline_form_sections sec
  WHERE sec.step_id = st.id AND sec.title = 'Participant Information'
);

INSERT INTO skyline_form_questions (section_id, type, code, label, required, sort_order, role_visibility, role_editability, pdf_meta)
SELECT sec.id, q.typ, q.code, q.lbl, false, q.ord, q.role_visibility, q.role_editability, '{}'::jsonb
FROM skyline_form_sections sec
JOIN skyline_form_steps st ON st.id = sec.step_id
CROSS JOIN (
  VALUES
    (0, 'short_text', 'evaluation.unitName', 'Unit of Competency Name', '{"student": true, "trainer": true, "office": true}'::jsonb, '{"student": false, "trainer": false, "office": false}'::jsonb),
    (1, 'short_text', 'evaluation.studentName', 'Student Name (Optional)', '{"student": true, "trainer": true, "office": true}'::jsonb, '{"student": true, "trainer": true, "office": true}'::jsonb),
    (2, 'short_text', 'evaluation.trainerName', 'Trainer/Assessor Name', '{"student": true, "trainer": true, "office": true}'::jsonb, '{"student": false, "trainer": false, "office": false}'::jsonb),
    (3, 'short_text', 'evaluation.employer', 'Employer/Work site (if applicable)', '{"student": true, "trainer": true, "office": true}'::jsonb, '{"student": true, "trainer": true, "office": true}'::jsonb),
    (4, 'short_text', 'evaluation.trainingDates', 'Dates of Training', '{"student": true, "trainer": true, "office": true}'::jsonb, '{"student": false, "trainer": false, "office": false}'::jsonb),
    (5, 'short_text', 'evaluation.evaluationDate', 'Date of Evaluation', '{"student": true, "trainer": true, "office": true}'::jsonb, '{"student": true, "trainer": true, "office": true}'::jsonb)
) AS q(ord, typ, code, lbl, role_visibility, role_editability)
WHERE st.title = 'Learner Evaluation'
AND sec.title = 'Participant Information'
AND NOT EXISTS (SELECT 1 FROM skyline_form_questions qq WHERE qq.section_id = sec.id);

-- Logistics and Support Evaluation Section
INSERT INTO skyline_form_sections (step_id, title, description, pdf_render_mode, sort_order)
SELECT st.id,
  'Logistics and Support Evaluation',
  NULL,
  'likert_table',
  1
FROM skyline_form_steps st
WHERE st.title = 'Learner Evaluation'
AND NOT EXISTS (
  SELECT 1 FROM skyline_form_sections sec
  WHERE sec.step_id = st.id AND sec.title = 'Logistics and Support Evaluation'
);

-- Trainer/Assessor Evaluation Section
INSERT INTO skyline_form_sections (step_id, title, description, pdf_render_mode, sort_order)
SELECT st.id,
  'Trainer/Assessor Evaluation',
  NULL,
  'likert_table',
  2
FROM skyline_form_steps st
WHERE st.title = 'Learner Evaluation'
AND NOT EXISTS (
  SELECT 1 FROM skyline_form_sections sec
  WHERE sec.step_id = st.id AND sec.title = 'Trainer/Assessor Evaluation'
);

-- Learning Evaluation Section
INSERT INTO skyline_form_sections (step_id, title, description, pdf_render_mode, sort_order)
SELECT st.id,
  'Learning Evaluation',
  NULL,
  'likert_table',
  3
FROM skyline_form_steps st
WHERE st.title = 'Learner Evaluation'
AND NOT EXISTS (
  SELECT 1 FROM skyline_form_sections sec
  WHERE sec.step_id = st.id AND sec.title = 'Learning Evaluation'
);

-- Add Likert questions and rows for each evaluation section
DO $$
DECLARE
  logistics_sec_id BIGINT;
  trainer_sec_id BIGINT;
  learning_sec_id BIGINT;
  logistics_q_id BIGINT;
  trainer_q_id BIGINT;
  learning_q_id BIGINT;
BEGIN
  -- Logistics and Support Evaluation
  FOR logistics_sec_id IN 
    SELECT sec.id FROM skyline_form_sections sec
    JOIN skyline_form_steps st ON st.id = sec.step_id
    WHERE st.title = 'Learner Evaluation' AND sec.title = 'Logistics and Support Evaluation'
    AND NOT EXISTS (SELECT 1 FROM skyline_form_questions q WHERE q.section_id = sec.id)
  LOOP
    INSERT INTO skyline_form_questions (section_id, type, code, label, sort_order, role_visibility, role_editability, pdf_meta)
    VALUES (logistics_sec_id, 'likert_5', 'evaluation.logistics', 'Logistics and Support Evaluation', 0, '{"student": true, "trainer": true, "office": true}'::jsonb, '{"student": true, "trainer": true, "office": true}'::jsonb, '{}'::jsonb)
    RETURNING id INTO logistics_q_id;
    
    INSERT INTO skyline_form_question_rows (question_id, row_label, sort_order) VALUES
      (logistics_q_id, 'The communication regarding the required attendance and time to study to pass this unit was correct', 0),
      (logistics_q_id, 'The staff were efficient and helpful.', 1),
      (logistics_q_id, 'The training equipment and material used was effective and prepared.', 2),
      (logistics_q_id, 'The training venue was conducive to learning (set-up for convenience of students, comfortable in terms of temperature, etc.)', 3);
    
    INSERT INTO skyline_form_questions (section_id, type, code, label, sort_order, role_visibility, role_editability, pdf_meta)
    VALUES (logistics_sec_id, 'long_text', 'evaluation.logisticsComments', 'Additional Comments on Logistics and Support', 1, '{"student": true, "trainer": true, "office": true}'::jsonb, '{"student": true, "trainer": true, "office": true}'::jsonb, '{}'::jsonb);
  END LOOP;

  -- Trainer/Assessor Evaluation
  FOR trainer_sec_id IN 
    SELECT sec.id FROM skyline_form_sections sec
    JOIN skyline_form_steps st ON st.id = sec.step_id
    WHERE st.title = 'Learner Evaluation' AND sec.title = 'Trainer/Assessor Evaluation'
    AND NOT EXISTS (SELECT 1 FROM skyline_form_questions q WHERE q.section_id = sec.id)
  LOOP
    INSERT INTO skyline_form_questions (section_id, type, code, label, sort_order, role_visibility, role_editability, pdf_meta)
    VALUES (trainer_sec_id, 'likert_5', 'evaluation.trainer', 'Trainer/Assessor Evaluation', 0, '{"student": true, "trainer": true, "office": true}'::jsonb, '{"student": true, "trainer": true, "office": true}'::jsonb, '{}'::jsonb)
    RETURNING id INTO trainer_q_id;
    
    INSERT INTO skyline_form_question_rows (question_id, row_label, sort_order) VALUES
      (trainer_q_id, 'The trainer/assessor was prepared and knowledgeable on the subject of the program', 0),
      (trainer_q_id, 'The trainer/assessor encouraged student participation and input', 1),
      (trainer_q_id, 'The trainer/assessor made use of a variety of methods, exercises, activities and discussions', 2),
      (trainer_q_id, 'The trainer/assessor used the material in a structured and effective manner', 3),
      (trainer_q_id, 'The trainer/assessor was approachable and respectful of the learners', 4),
      (trainer_q_id, 'The trainer/assessor was punctual and kept to the schedule', 5),
      (trainer_q_id, 'The trainer/assessor was easy to understand and used the correct language', 6);
    
    INSERT INTO skyline_form_questions (section_id, type, code, label, sort_order, role_visibility, role_editability, pdf_meta)
    VALUES (trainer_sec_id, 'long_text', 'evaluation.trainerComments', 'Additional Comments on Training', 1, '{"student": true, "trainer": true, "office": true}'::jsonb, '{"student": true, "trainer": true, "office": true}'::jsonb, '{}'::jsonb);
  END LOOP;

  -- Learning Evaluation
  FOR learning_sec_id IN 
    SELECT sec.id FROM skyline_form_sections sec
    JOIN skyline_form_steps st ON st.id = sec.step_id
    WHERE st.title = 'Learner Evaluation' AND sec.title = 'Learning Evaluation'
    AND NOT EXISTS (SELECT 1 FROM skyline_form_questions q WHERE q.section_id = sec.id)
  LOOP
    INSERT INTO skyline_form_questions (section_id, type, code, label, sort_order, role_visibility, role_editability, pdf_meta)
    VALUES (learning_sec_id, 'likert_5', 'evaluation.learning', 'Learning Evaluation', 0, '{"student": true, "trainer": true, "office": true}'::jsonb, '{"student": true, "trainer": true, "office": true}'::jsonb, '{}'::jsonb)
    RETURNING id INTO learning_q_id;
    
    INSERT INTO skyline_form_question_rows (question_id, row_label, sort_order) VALUES
      (learning_q_id, 'The learning outcomes of the unit are relevant and suitable.', 0),
      (learning_q_id, 'The content of the unit was relevant and suitable for the target group.', 1),
      (learning_q_id, 'The length of the training was suitable for the unit.', 2),
      (learning_q_id, 'The learning material assisted in the learning of new knowledge and skills to apply in a practical manner.', 3),
      (learning_q_id, 'The learning material was free from spelling and grammar errors', 4),
      (learning_q_id, 'Handouts and exercises were clear, concise and relevant to the outcomes and content.', 5),
      (learning_q_id, 'Learning material was generally of a high standard, and user-friendly', 6);
    
    INSERT INTO skyline_form_questions (section_id, type, code, label, sort_order, role_visibility, role_editability, pdf_meta)
    VALUES (learning_sec_id, 'long_text', 'evaluation.learningComments', 'Additional Comments on Learning Evaluation', 1, '{"student": true, "trainer": true, "office": true}'::jsonb, '{"student": true, "trainer": true, "office": true}'::jsonb, '{}'::jsonb);
  END LOOP;
END $$;
