-- Trainer-filled Results Sheet data (Outcome, Feedback, Trainer/Assessor fields)
CREATE TABLE skyline_form_results_data (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  instance_id BIGINT NOT NULL REFERENCES skyline_form_instances(id) ON DELETE CASCADE,
  section_id BIGINT NOT NULL REFERENCES skyline_form_sections(id) ON DELETE CASCADE,
  first_attempt_satisfactory TEXT CHECK (first_attempt_satisfactory IN ('s', 'ns')),
  first_attempt_date TEXT,
  first_attempt_feedback TEXT,
  second_attempt_satisfactory TEXT CHECK (second_attempt_satisfactory IN ('s', 'ns')),
  second_attempt_date TEXT,
  second_attempt_feedback TEXT,
  trainer_name TEXT,
  trainer_signature TEXT,
  trainer_date TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(instance_id, section_id)
);

CREATE INDEX idx_skyline_form_results_data_instance ON skyline_form_results_data(instance_id);
