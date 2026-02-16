# Dynamic Assignment Instructions – Design Plan

This document describes how to make assignment instructions dynamic and support the structure: **Instructions → Questions → Results** for each task (including sub-tasks like 2.1, 2.2, 2.3).

---

## Current State

- **Assessment tasks** are stored as rows in a `grid_table` question (`assessment.tasks`)
- Each row has: `row_label` (e.g. "Assessment task 1") and `row_help` (e.g. "Written Assessment (WA)")
- Instructions content is **static** – there is no per-task configurable content
- No per-task questions or results – the form is flat

---

## Target Structure (per task)

For each task (1, 2.1, 2.2, 2.3):

1. **Student Instructions** – Dynamic content:
   - Assessment type (e.g. "Written Questions")
   - Instructions provided to the student
   - Assessment task description (bullets)
   - Applicable conditions
   - Resubmissions and reattempts
   - Location (checkboxes)
   - Instructions for answering the written questions
   - Purpose of the assessment (intro + bullets)

2. **Task instructions** – Short bullet list (e.g. "This is an individual assessment")

3. **Questions** – The actual questions for that task (short_text, long_text, etc.)

4. **Results sheet** – First attempt, Second attempt, Feedback, Student Declaration, Trainer/Assessor, Office Use

---

## Proposed Data Model

### 1. Extend `skyline_form_question_rows` (assessment task rows)

Add a `row_meta` JSONB column to store dynamic instructions per task:

```sql
ALTER TABLE skyline_form_question_rows ADD COLUMN IF NOT EXISTS row_meta JSONB DEFAULT '{}';
```

**`row_meta` structure (rich text stored as HTML from Quill editor):**

```json
{
  "instructions": {
    "assessment_type": "<p>Written Questions</p>",
    "task_description": "• This is the first (1) assessment task\n• It comprises five (5) written questions\n• You must respond to all questions...",
    "applicable_conditions": "• All knowledge tests are untimed and open book\n• You must read and respond to all questions...",
    "resubmissions": "• Resubmission attempt will be allowed if...",
    "location_intro": "This assessment task may be completed in:",
    "location_options": ["a classroom", "learning management system (e.g. Moodle)", "workplace", "an independent learning environment"],
    "location_note": "Your trainer/assessor will provide further information regarding the location.",
    "answering_instructions": "• Complete all questions correctly\n• Read questions carefully before answering...",
    "purpose_intro": "This assessment task is designed to evaluate student's knowledge essential to...",
    "purpose_bullets": ["terminology and definitions", "job safety analyses", "relevant laws and regulations", "..."]
  },
  "task_instructions": [
    "This is an individual assessment.",
    "To ensure your responses are satisfactory, consult a range of learning resources.",
    "To be assessed as Satisfactory in this assessment task all questions must be answered correctly."
  ]
}
```

### 2. Link sections to assessment tasks

Add `assessment_task_row_id` (nullable) to `skyline_form_sections`:

```sql
ALTER TABLE skyline_form_sections ADD COLUMN IF NOT EXISTS assessment_task_row_id BIGINT REFERENCES skyline_form_question_rows(id) ON DELETE SET NULL;
```

- Sections with `assessment_task_row_id = NULL` → global (current behaviour)
- Sections with `assessment_task_row_id = 123` → belong to that task only

### 3. New `pdf_render_mode` values

| Mode | Purpose |
|------|---------|
| `task_instructions` | Renders dynamic instructions from `row_meta` for the linked task |
| `task_questions` | Renders questions for that task (normal questions in section) |
| `task_results` | Renders results template (First attempt, Second attempt, Feedback, Declaration, Trainer, Office) |

---

## Form structure (admin creates)

When creating a form, the admin defines assessment tasks (rows). For each task, the admin can:

1. **Set task label** – e.g. "Assessment task 1", "Task 2.1", "Task 2.2"
2. **Set assessment method** – e.g. "Written Assessment (WA)", "Practical Task"
3. **Edit instructions** – via a modal or expandable panel, fill in the `row_meta.instructions` fields
4. **Add questions** – create a section with `pdf_render_mode: task_questions` and `assessment_task_row_id` pointing to that task
5. **Add results** – create a section with `pdf_render_mode: task_results` (template is mostly fixed; task title comes from row_label)

**Example step layout:**

- Step: "Assessment Tasks"
  - Section: "Assessment Tasks" (table) – `assessment_tasks`
  - Section: "Task 1 – Student Instructions" – `task_instructions`, `assessment_task_row_id` = row 1
  - Section: "Task 1 – Questions" – `task_questions`, `assessment_task_row_id` = row 1
  - Section: "Task 1 – Results" – `task_results`, `assessment_task_row_id` = row 1
  - Section: "Task 2.1 – Student Instructions" – `task_instructions`, `assessment_task_row_id` = row 2
  - Section: "Task 2.1 – Questions" – `task_questions`, `assessment_task_row_id` = row 2
  - Section: "Task 2.1 – Results" – `task_results`, `assessment_task_row_id` = row 2
  - … etc.

---

## Admin UI changes

1. **Assessment task row editor**
   - When editing an assessment task row, show an "Edit instructions" button
   - Modal or slide-over with fields for each instruction block (assessment type, task description, conditions, etc.)
   - Save to `row_meta`

2. **Section creation**
   - When adding a section, allow choosing `pdf_render_mode`: `task_instructions`, `task_questions`, `task_results`
   - If one of these, require selecting which assessment task row it belongs to (dropdown of task labels)

3. **Task numbering (2.1, 2.2, 2.3)**
   - Support multiple rows under "Task 2" – e.g. rows: "Task 2.1", "Task 2.2", "Task 2.3"
   - Or a parent/child structure if needed (can start with flat rows)

---

## PDF generation changes

For each `pdf_render_mode`:

1. **`task_instructions`**
   - Resolve `assessment_task_row_id` → get row, read `row_meta.instructions`
   - Render "Student Instructions: {row_label} – {assessment_type}" header
   - Render each block (Assessment type, Instructions provided to student, Applicable conditions, etc.) with grey header bars and bullet content

2. **`task_questions`**
   - Render section title: "Task instructions" or "{row_label} – Questions"
   - Render questions in section (short_text, long_text, etc.) with answer boxes

3. **`task_results`**
   - Render "Assessment Task X – Results Sheet"
   - First attempt (S/NS, Date, Feedback)
   - Second attempt (S/NS, Date, Feedback)
   - Student Declaration (bullets + signature)
   - Trainer/Assessor (Name, Signature, Date)
   - Office Use Only

---

## Form fill (InstanceFillPage) changes

- Sections with `task_instructions` → read-only display of instructions (no inputs)
- Sections with `task_questions` → render questions for student/trainer to fill
- Sections with `task_results` → render outcome fields (trainer fills S/NS, feedback, etc.)

---

## Implementation order

1. **Migration** – Add `row_meta` to `skyline_form_question_rows`, `assessment_task_row_id` to `skyline_form_sections`, new `pdf_render_mode` values
2. **PDF server** – Implement `task_instructions`, `task_questions`, `task_results` rendering
3. **Admin form builder** – Add instruction editor for assessment task rows, section-type + task linking
4. **Instance fill page** – Render task sections correctly
5. **Form creation flow** – When creating a form with 2 tasks, auto-create the Instruction → Questions → Results sections for each (or let admin add manually)

---

## Simpler alternative (fewer schema changes)

If you want to avoid new columns initially:

- Store instructions in `row_help` as structured text (e.g. markdown or a simple delimiter format)
- Use **step ordering** to imply structure: create steps "Task 1 Instructions", "Task 1 Questions", "Task 1 Results" and detect by title pattern
- Less flexible but faster to implement

---

## Summary

| Component | Change |
|-----------|--------|
| **DB** | `row_meta` on question rows, `assessment_task_row_id` on sections, new pdf_render_mode values |
| **Admin** | Instruction editor per task row, section-type + task selector |
| **PDF** | New renderers for task_instructions, task_questions, task_results |
| **Form fill** | Render task sections with correct behaviour (read-only vs editable) |

This design supports dynamic instructions per task and the Instructions → Questions → Results flow for 2.1, 2.2, 2.3 and beyond.
