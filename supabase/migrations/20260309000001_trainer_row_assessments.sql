-- Per-row satisfactory response for Assessment Task 2+ grid_table questions
-- Used when each table row has its own check/cancel icon instead of per-question satisfactory
CREATE TABLE skyline_form_trainer_row_assessments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  instance_id BIGINT NOT NULL REFERENCES skyline_form_instances(id) ON DELETE CASCADE,
  question_id BIGINT NOT NULL REFERENCES skyline_form_questions(id) ON DELETE CASCADE,
  row_id BIGINT NOT NULL REFERENCES skyline_form_question_rows(id) ON DELETE CASCADE,
  satisfactory TEXT CHECK (satisfactory IN ('yes', 'no')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(instance_id, question_id, row_id)
);

CREATE INDEX idx_skyline_form_trainer_row_assessments_instance ON skyline_form_trainer_row_assessments(instance_id);
