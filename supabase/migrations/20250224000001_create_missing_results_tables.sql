-- Ensure results-related tables exist (in case earlier migrations were not applied)
-- skyline_form_results_office
CREATE TABLE IF NOT EXISTS skyline_form_results_office (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  instance_id BIGINT NOT NULL REFERENCES skyline_form_instances(id) ON DELETE CASCADE,
  section_id BIGINT NOT NULL REFERENCES skyline_form_sections(id) ON DELETE CASCADE,
  entered_date DATE,
  entered_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(instance_id, section_id)
);

CREATE INDEX IF NOT EXISTS idx_skyline_form_results_office_instance ON skyline_form_results_office(instance_id);

-- skyline_form_results_data
CREATE TABLE IF NOT EXISTS skyline_form_results_data (
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

CREATE INDEX IF NOT EXISTS idx_skyline_form_results_data_instance ON skyline_form_results_data(instance_id);

-- skyline_form_assessment_summary_data
CREATE TABLE IF NOT EXISTS skyline_form_assessment_summary_data (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  instance_id BIGINT NOT NULL REFERENCES skyline_form_instances(id) ON DELETE CASCADE,
  start_date TEXT,
  end_date TEXT,
  final_attempt_1_result TEXT CHECK (final_attempt_1_result IN ('competent', 'not_yet_competent')),
  final_attempt_2_result TEXT CHECK (final_attempt_2_result IN ('competent', 'not_yet_competent')),
  final_attempt_3_result TEXT CHECK (final_attempt_3_result IN ('competent', 'not_yet_competent')),
  trainer_sig_1 TEXT,
  trainer_date_1 TEXT,
  trainer_sig_2 TEXT,
  trainer_date_2 TEXT,
  trainer_sig_3 TEXT,
  trainer_date_3 TEXT,
  student_sig_1 TEXT,
  student_date_1 TEXT,
  student_sig_2 TEXT,
  student_date_2 TEXT,
  student_sig_3 TEXT,
  student_date_3 TEXT,
  student_overall_feedback TEXT,
  admin_initials TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(instance_id)
);

CREATE INDEX IF NOT EXISTS idx_skyline_form_assessment_summary_instance ON skyline_form_assessment_summary_data(instance_id);
