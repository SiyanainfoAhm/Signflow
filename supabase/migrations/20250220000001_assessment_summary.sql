-- Assessment Summary Sheet: Add 'assessment_summary' to pdf_render_mode constraint
ALTER TABLE skyline_form_sections DROP CONSTRAINT IF EXISTS skyline_form_sections_pdf_render_mode_check;
ALTER TABLE skyline_form_sections ADD CONSTRAINT skyline_form_sections_pdf_render_mode_check
  CHECK (pdf_render_mode IN (
    'normal', 'likert_table', 'grid_table', 'declarations',
    'assessment_tasks', 'assessment_submission', 'reasonable_adjustment',
    'task_instructions', 'task_questions', 'task_results',
    'assessment_summary'
  ));

-- Assessment Summary Sheet data (common section after last assessment)
CREATE TABLE skyline_form_assessment_summary_data (
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

CREATE INDEX idx_skyline_form_assessment_summary_instance ON skyline_form_assessment_summary_data(instance_id);
