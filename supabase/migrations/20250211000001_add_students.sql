-- skyline_students table for admin to manage and send forms to
CREATE TABLE skyline_students (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_skyline_students_email ON skyline_students(email);

-- Add student_id to form_instances to link instances to students
ALTER TABLE skyline_form_instances
  ADD COLUMN student_id BIGINT REFERENCES skyline_students(id) ON DELETE SET NULL;

CREATE INDEX idx_skyline_form_instances_student_id ON skyline_form_instances(student_id);
