import { supabase } from './supabase';
import { createDefaultSectionsToStep } from './defaultFormSteps';
import type {
  Form,
  FormStep,
  FormSection,
  FormQuestion,
  FormQuestionOption,
  FormQuestionRow,
  FormInstance,
  FormAnswer,
} from '../types/database';

export interface FormStepWithSections extends FormStep {
  sections: FormSectionWithQuestions[];
}

export interface FormSectionWithQuestions extends FormSection {
  questions: FormQuestionWithOptionsAndRows[];
}

export interface FormQuestionWithOptionsAndRows extends FormQuestion {
  options: FormQuestionOption[];
  rows: FormQuestionRow[];
}

export interface FormTemplate {
  form: Form;
  steps: FormStepWithSections[];
}

export interface InstanceWithAnswers {
  instance: FormInstance;
  answers: FormAnswer[];
}


export async function fetchForm(formId: number): Promise<Form | null> {
  const { data, error } = await supabase.from('skyline_forms').select('*').eq('id', formId).single();
  if (error) {
    console.error('fetchForm error', error);
    return null;
  }
  return data as Form;
}

export async function updateForm(formId: number, updates: Partial<Pick<Form, 'name' | 'version' | 'unit_code' | 'header_asset_url' | 'cover_asset_url'>>): Promise<{ error: Error | null }> {
  const { error } = await supabase.from('skyline_forms').update(updates).eq('id', formId);
  return { error: error ? new Error(error.message) : null };
}

export async function fetchFormSteps(formId: number): Promise<FormStep[]> {
  const { data, error } = await supabase
    .from('skyline_form_steps')
    .select('*')
    .eq('form_id', formId)
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('fetchFormSteps error', error);
    return [];
  }
  return (data as FormStep[]) || [];
}

export async function fetchInstance(instanceId: number): Promise<FormInstance | null> {
  const { data, error } = await supabase.from('skyline_form_instances').select('*').eq('id', instanceId).single();
  if (error) {
    console.error('fetchInstance error', error);
    return null;
  }
  return data as FormInstance;
}

export async function fetchTemplateForInstance(instanceId: number): Promise<FormTemplate | null> {
  const instance = await fetchInstance(instanceId);
  if (!instance) return null;

  const form = await fetchForm(instance.form_id);
  if (!form) return null;

  const steps = await fetchFormSteps(instance.form_id);
  const stepsWithSections: FormStepWithSections[] = [];

  for (const step of steps) {
    const { data: sections } = await supabase
      .from('skyline_form_sections')
      .select('*')
      .eq('step_id', step.id)
      .order('sort_order', { ascending: true });
    const sectionsList = (sections as FormSection[]) || [];

    const sectionsWithQuestions: FormSectionWithQuestions[] = [];
    for (const section of sectionsList) {
      const { data: questions } = await supabase
        .from('skyline_form_questions')
        .select('*')
        .eq('section_id', section.id)
        .order('sort_order', { ascending: true });
      const questionsList = (questions as FormQuestion[]) || [];

      const questionsWithExtras: FormQuestionWithOptionsAndRows[] = [];
      for (const q of questionsList) {
        const { data: options } = await supabase
          .from('skyline_form_question_options')
          .select('*')
          .eq('question_id', q.id)
          .order('sort_order', { ascending: true });
        const { data: rows } = await supabase
          .from('skyline_form_question_rows')
          .select('*')
          .eq('question_id', q.id)
          .order('sort_order', { ascending: true });
        questionsWithExtras.push({
          ...q,
          options: (options as FormQuestionOption[]) || [],
          rows: (rows as FormQuestionRow[]) || [],
        });
      }
      sectionsWithQuestions.push({ ...section, questions: questionsWithExtras });
    }
    stepsWithSections.push({ ...step, sections: sectionsWithQuestions });
  }

  return { form, steps: stepsWithSections };
}

export async function fetchAnswersForInstance(instanceId: number): Promise<FormAnswer[]> {
  const { data, error } = await supabase
    .from('skyline_form_answers')
    .select('*')
    .eq('instance_id', instanceId);
  if (error) {
    console.error('fetchAnswersForInstance error', error);
    return [];
  }
  return (data as FormAnswer[]) || [];
}

export async function saveAnswer(
  instanceId: number,
  questionId: number,
  rowId: number | null,
  value: { text?: string; number?: number; json?: unknown }
): Promise<void> {
  const q = supabase
    .from('skyline_form_answers')
    .select('id')
    .eq('instance_id', instanceId)
    .eq('question_id', questionId);

  const { data: existing } = rowId === null
    ? await q.is('row_id', null).maybeSingle()
    : await q.eq('row_id', rowId).maybeSingle();

  const payload = {
    value_text: value.text ?? null,
    value_number: value.number ?? null,
    value_json: value.json ?? null,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    await supabase.from('skyline_form_answers').update(payload).eq('id', existing.id);
  } else {
    await supabase.from('skyline_form_answers').insert({
      instance_id: instanceId,
      question_id: questionId,
      row_id: rowId,
      ...payload,
    });
  }
}

export async function createFormInstance(
  formId: number,
  roleContext: string,
  studentId?: number | null
): Promise<FormInstance | null> {
  const insert: Record<string, unknown> = { form_id: formId, role_context: roleContext };
  if (studentId != null) insert.student_id = studentId;
  const { data, error } = await supabase
    .from('skyline_form_instances')
    .insert(insert)
    .select('*')
    .single();
  if (error) {
    console.error('createFormInstance error', error);
    return null;
  }
  return data as FormInstance;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export async function listStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from('skyline_students')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('listStudents error', error);
    return [];
  }
  return (data as Student[]) || [];
}

export async function createStudent(name: string, email: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from('skyline_students')
    .insert({ name, email })
    .select('*')
    .single();
  if (error) {
    console.error('createStudent error', error);
    return null;
  }
  return data as Student;
}

const DEFAULT_ROLES = { student: true, trainer: true, office: true };
const READ_ONLY_VISIBLE = { student: true, trainer: true, office: true };
const READ_ONLY_EDIT = { student: false, trainer: false, office: false };
const TRAINER_ONLY_EDIT = { student: false, trainer: true, office: false };

async function createCompulsoryFormStructure(formId: number): Promise<void> {
  // Single compulsory step: Student & Trainer, Qualification, Assessment Tasks, Assessment Submission
  // Subtitle "Student, trainer, qualification & assessment" is used only for this step; other steps keep their own titles/subtitles
  const { data: step } = await supabase
    .from('skyline_form_steps')
    .insert({ form_id: formId, title: 'Introductory Details', subtitle: 'Student, trainer, qualification & assessment', sort_order: 0 })
    .select('id')
    .single();
  if (!step) return;
  const stepId = (step as { id: number }).id;

  const { data: sec1 } = await supabase
    .from('skyline_form_sections')
    .insert({ step_id: stepId, title: 'Student and trainer details', pdf_render_mode: 'normal', sort_order: 0 })
    .select('id')
    .single();
  if (sec1) {
    const s = sec1 as { id: number };
    await supabase.from('skyline_form_questions').insert([
      { section_id: s.id, type: 'short_text', code: 'student.fullName', label: 'Student Full Name', required: true, sort_order: 0, role_visibility: DEFAULT_ROLES, role_editability: DEFAULT_ROLES },
      { section_id: s.id, type: 'short_text', code: 'student.id', label: 'Student ID', required: true, sort_order: 1, role_visibility: DEFAULT_ROLES, role_editability: DEFAULT_ROLES },
      { section_id: s.id, type: 'short_text', code: 'student.email', label: 'Student Email', required: true, sort_order: 2, role_visibility: DEFAULT_ROLES, role_editability: DEFAULT_ROLES },
      { section_id: s.id, type: 'short_text', code: 'trainer.fullName', label: 'Trainer Full Name', required: true, sort_order: 3, role_visibility: DEFAULT_ROLES, role_editability: DEFAULT_ROLES },
    ]);
  }

  const { data: sec2a } = await supabase
    .from('skyline_form_sections')
    .insert({ step_id: stepId, title: 'Qualification and unit of competency', pdf_render_mode: 'normal', sort_order: 1 })
    .select('id')
    .single();
  if (sec2a) {
    const s = sec2a as { id: number };
    await supabase.from('skyline_form_questions').insert([
      { section_id: s.id, type: 'short_text', code: 'qualification.code', label: 'Qualification Code', sort_order: 0, role_visibility: DEFAULT_ROLES, role_editability: DEFAULT_ROLES },
      { section_id: s.id, type: 'short_text', code: 'qualification.name', label: 'Qualification Name', sort_order: 1, role_visibility: DEFAULT_ROLES, role_editability: DEFAULT_ROLES },
      { section_id: s.id, type: 'short_text', code: 'unit.code', label: 'Unit Code', sort_order: 2, role_visibility: DEFAULT_ROLES, role_editability: DEFAULT_ROLES },
      { section_id: s.id, type: 'short_text', code: 'unit.name', label: 'Unit Name', sort_order: 3, role_visibility: DEFAULT_ROLES, role_editability: DEFAULT_ROLES },
    ]);
  }

  const { data: sec2b } = await supabase
    .from('skyline_form_sections')
    .insert({ step_id: stepId, title: 'Assessment Tasks', description: 'The student must be assessed as satisfactory in each of the following assessment tasks in order to demonstrate competence.', pdf_render_mode: 'assessment_tasks', sort_order: 2 })
    .select('id')
    .single();
  if (sec2b) {
    const s = sec2b as { id: number };
    const { data: q } = await supabase
      .from('skyline_form_questions')
      .insert({ section_id: s.id, type: 'grid_table', code: 'assessment.tasks', label: 'Assessment Tasks', sort_order: 0, role_visibility: READ_ONLY_VISIBLE, role_editability: READ_ONLY_EDIT, pdf_meta: { columns: ['Evidence number', 'Assessment method/ Type of evidence'] } })
      .select('id')
      .single();
    if (q) {
      const qid = (q as { id: number }).id;
      await supabase.from('skyline_form_question_rows').insert([
        { question_id: qid, row_label: 'Assessment task 1', row_help: 'Written Assessment (WA)', sort_order: 0 },
        { question_id: qid, row_label: 'Assessment task 2', row_help: 'Practical Task 2.1\nPractical Task 2.2\nPractical Task 2.3', sort_order: 1 },
      ]);
    }
  }

  const { data: sec2c } = await supabase
    .from('skyline_form_sections')
    .insert({ step_id: stepId, title: 'Assessment Submission Method', pdf_render_mode: 'assessment_submission', sort_order: 3 })
    .select('id')
    .single();
  if (sec2c) {
    const s = sec2c as { id: number };
    const { data: qSub } = await supabase
      .from('skyline_form_questions')
      .insert({ section_id: s.id, type: 'multi_choice', code: 'assessment.submission', label: 'Assessment Submission Method', sort_order: 0, role_visibility: READ_ONLY_VISIBLE, role_editability: TRAINER_ONLY_EDIT })
      .select('id')
      .single();
    if (qSub) {
      const qid = (qSub as { id: number }).id;
      await supabase.from('skyline_form_question_options').insert([
        { question_id: qid, value: 'hand', label: 'By hand to trainer/assessor', sort_order: 0 },
        { question_id: qid, value: 'email', label: 'By email to trainer/assessor', sort_order: 1 },
        { question_id: qid, value: 'lms', label: 'Online submission via Learning Management System (LMS)', sort_order: 2 },
        { question_id: qid, value: 'other', label: 'Any other method', sort_order: 3 },
      ]);
    }
    await supabase.from('skyline_form_questions').insert({ section_id: s.id, type: 'short_text', code: 'assessment.otherDesc', label: 'Please describe other method', sort_order: 1, role_visibility: READ_ONLY_VISIBLE, role_editability: TRAINER_ONLY_EDIT });
  }

  await createDefaultSectionsToStep(stepId, 4);
}

export async function createForm(name: string): Promise<Form | null> {
  const { data, error } = await supabase.from('skyline_forms').insert({ name }).select('*').single();
  if (error) {
    console.error('createForm error', error);
    return null;
  }
  const form = data as Form;
  await createCompulsoryFormStructure(form.id);
  return form;
}

export async function listForms(status?: string): Promise<Form[]> {
  let query = supabase.from('skyline_forms').select('*').order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) {
    console.error('listForms error', error);
    return [];
  }
  return (data as Form[]) || [];
}

export async function updateInstanceRole(instanceId: number, roleContext: string): Promise<void> {
  await supabase.from('skyline_form_instances').update({ role_context: roleContext }).eq('id', instanceId);
}
