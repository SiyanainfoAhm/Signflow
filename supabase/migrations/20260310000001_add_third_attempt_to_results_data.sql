-- Add third attempt columns to results data (3 attempts total for assessment answersheets)
ALTER TABLE skyline_form_results_data
  ADD COLUMN IF NOT EXISTS third_attempt_satisfactory TEXT CHECK (third_attempt_satisfactory IN ('s', 'ns')),
  ADD COLUMN IF NOT EXISTS third_attempt_date TEXT,
  ADD COLUMN IF NOT EXISTS third_attempt_feedback TEXT;

-- No data backfill needed - existing rows will have NULL for third attempt, which is correct.
