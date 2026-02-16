-- Trainer satisfactory response per question (trainer-only editable)
CREATE TABLE skyline_form_trainer_assessments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  instance_id BIGINT NOT NULL REFERENCES skyline_form_instances(id) ON DELETE CASCADE,
  question_id BIGINT NOT NULL REFERENCES skyline_form_questions(id) ON DELETE CASCADE,
  satisfactory TEXT CHECK (satisfactory IN ('yes', 'no')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(instance_id, question_id)
);

CREATE INDEX idx_skyline_form_trainer_assessments_instance ON skyline_form_trainer_assessments(instance_id);
