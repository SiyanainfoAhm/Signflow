-- Office Use Only fields for Results Sheet (date and name)
CREATE TABLE skyline_form_results_office (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  instance_id BIGINT NOT NULL REFERENCES skyline_form_instances(id) ON DELETE CASCADE,
  section_id BIGINT NOT NULL REFERENCES skyline_form_sections(id) ON DELETE CASCADE,
  entered_date DATE,
  entered_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(instance_id, section_id)
);

CREATE INDEX idx_skyline_form_results_office_instance ON skyline_form_results_office(instance_id);
