-- SignFlow Form Builder Schema
-- All primary keys use BIGINT GENERATED ALWAYS AS IDENTITY (no UUID)
-- RLS is NOT enabled
-- All tables use skyline_ prefix

-- skyline_forms
CREATE TABLE skyline_forms (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  unit_code TEXT,
  header_asset_url TEXT,
  cover_asset_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- skyline_form_steps
CREATE TABLE skyline_form_steps (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  form_id BIGINT NOT NULL REFERENCES skyline_forms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  sort_order INT DEFAULT 0
);

CREATE INDEX idx_skyline_form_steps_form_id ON skyline_form_steps(form_id);
CREATE INDEX idx_skyline_form_steps_sort_order ON skyline_form_steps(sort_order);

-- skyline_form_sections
CREATE TABLE skyline_form_sections (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  step_id BIGINT NOT NULL REFERENCES skyline_form_steps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  pdf_render_mode TEXT DEFAULT 'normal' CHECK (pdf_render_mode IN ('normal', 'likert_table', 'grid_table', 'declarations')),
  sort_order INT DEFAULT 0
);

CREATE INDEX idx_skyline_form_sections_step_id ON skyline_form_sections(step_id);
CREATE INDEX idx_skyline_form_sections_sort_order ON skyline_form_sections(sort_order);

-- skyline_form_questions
CREATE TABLE skyline_form_questions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  section_id BIGINT NOT NULL REFERENCES skyline_form_sections(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'instruction_block', 'short_text', 'long_text', 'yes_no', 'single_choice', 'multi_choice',
    'likert_5', 'grid_table', 'date', 'signature', 'page_break'
  )),
  code TEXT,
  label TEXT NOT NULL,
  help_text TEXT,
  required BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  role_visibility JSONB DEFAULT '{}',
  role_editability JSONB DEFAULT '{}',
  pdf_meta JSONB DEFAULT '{}'
);

CREATE INDEX idx_skyline_form_questions_section_id ON skyline_form_questions(section_id);
CREATE INDEX idx_skyline_form_questions_sort_order ON skyline_form_questions(sort_order);

-- skyline_form_question_options
CREATE TABLE skyline_form_question_options (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  question_id BIGINT NOT NULL REFERENCES skyline_form_questions(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

CREATE INDEX idx_skyline_form_question_options_question_id ON skyline_form_question_options(question_id);
CREATE INDEX idx_skyline_form_question_options_sort_order ON skyline_form_question_options(sort_order);

-- skyline_form_question_rows
CREATE TABLE skyline_form_question_rows (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  question_id BIGINT NOT NULL REFERENCES skyline_form_questions(id) ON DELETE CASCADE,
  row_label TEXT NOT NULL,
  row_help TEXT,
  row_image_url TEXT,
  sort_order INT DEFAULT 0
);

CREATE INDEX idx_skyline_form_question_rows_question_id ON skyline_form_question_rows(question_id);
CREATE INDEX idx_skyline_form_question_rows_sort_order ON skyline_form_question_rows(sort_order);

-- skyline_form_instances
CREATE TABLE skyline_form_instances (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  form_id BIGINT NOT NULL REFERENCES skyline_forms(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'locked')),
  role_context TEXT DEFAULT 'student' CHECK (role_context IN ('student', 'trainer', 'office')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_skyline_form_instances_form_id ON skyline_form_instances(form_id);

-- skyline_form_answers
CREATE TABLE skyline_form_answers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  instance_id BIGINT NOT NULL REFERENCES skyline_form_instances(id) ON DELETE CASCADE,
  question_id BIGINT NOT NULL REFERENCES skyline_form_questions(id) ON DELETE CASCADE,
  row_id BIGINT REFERENCES skyline_form_question_rows(id) ON DELETE CASCADE,
  value_text TEXT,
  value_number NUMERIC,
  value_json JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE UNIQUE INDEX idx_skyline_form_answers_unique_null ON skyline_form_answers (instance_id, question_id) WHERE row_id IS NULL;
CREATE UNIQUE INDEX idx_skyline_form_answers_unique_row ON skyline_form_answers (instance_id, question_id, row_id) WHERE row_id IS NOT NULL;
CREATE INDEX idx_skyline_form_answers_instance_id ON skyline_form_answers(instance_id);
CREATE INDEX idx_skyline_form_answers_question_id ON skyline_form_answers(question_id);

-- skyline_form_assets
CREATE TABLE skyline_form_assets (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  form_id BIGINT NOT NULL REFERENCES skyline_forms(id) ON DELETE CASCADE,
  type TEXT,
  file_url TEXT NOT NULL,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_skyline_form_assets_form_id ON skyline_form_assets(form_id);
