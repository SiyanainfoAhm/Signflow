import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';

// Load .env from project root (parent of pdf-server)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface FormAnswer {
  question_id: number;
  row_id: number | null;
  value_text: string | null;
  value_number: number | null;
  value_json: unknown;
}

interface FormQuestion {
  id: number;
  section_id: number;
  type: string;
  code: string | null;
  label: string;
  help_text: string | null;
  required: boolean;
  sort_order: number;
  role_visibility: unknown;
  role_editability: unknown;
  pdf_meta: { columns?: string[] } & Record<string, unknown>;
}

interface FormSection {
  id: number;
  step_id: number;
  title: string;
  description: string | null;
  pdf_render_mode: string;
  sort_order: number;
}

interface FormQuestionRow {
  id: number;
  question_id: number;
  row_label: string;
  row_help: string | null;
  row_image_url: string | null;
  sort_order: number;
}

interface FormQuestionOption {
  id: number;
  question_id: number;
  value: string;
  label: string;
  sort_order: number;
}

async function getTemplateForInstance(instanceId: number) {
  const { data: instance } = await supabase
    .from('skyline_form_instances')
    .select('*')
    .eq('id', instanceId)
    .single();

  if (!instance) return null;

  const { data: form } = await supabase
    .from('skyline_forms')
    .select('*')
    .eq('id', instance.form_id)
    .single();

  if (!form) return null;

  const { data: steps } = await supabase
    .from('skyline_form_steps')
    .select('*')
    .eq('form_id', instance.form_id)
    .order('sort_order');

  const stepsWithSections: Array<{
    step: { id: number; title: string; subtitle: string | null; sort_order: number };
    sections: Array<{
      section: FormSection;
      questions: Array<{
        question: FormQuestion;
        options: FormQuestionOption[];
        rows: FormQuestionRow[];
      }>;
    }>;
  }> = [];

  for (const step of steps || []) {
    const { data: sections } = await supabase
      .from('skyline_form_sections')
      .select('*')
      .eq('step_id', step.id)
      .order('sort_order');

    const sectionsWithQs: Array<{
      section: FormSection;
      questions: Array<{
        question: FormQuestion;
        options: FormQuestionOption[];
        rows: FormQuestionRow[];
      }>;
    }> = [];

    for (const section of sections || []) {
      const { data: questions } = await supabase
        .from('skyline_form_questions')
        .select('*')
        .eq('section_id', section.id)
        .order('sort_order');

      const questionsWithExtras: Array<{
        question: FormQuestion;
        options: FormQuestionOption[];
        rows: FormQuestionRow[];
      }> = [];

      for (const q of questions || []) {
        const { data: options } = await supabase
          .from('skyline_form_question_options')
          .select('*')
          .eq('question_id', q.id)
          .order('sort_order');
        const { data: rows } = await supabase
          .from('skyline_form_question_rows')
          .select('*')
          .eq('question_id', q.id)
          .order('sort_order');
        questionsWithExtras.push({
          question: q as FormQuestion,
          options: (options as FormQuestionOption[]) || [],
          rows: (rows as FormQuestionRow[]) || [],
        });
      }
      sectionsWithQs.push({
        section: section as FormSection,
        questions: questionsWithExtras,
      });
    }
    stepsWithSections.push({ step: step as { id: number; title: string; subtitle: string | null; sort_order: number }, sections: sectionsWithQs });
  }

  return { instance: { ...instance, form }, steps: stepsWithSections };
}

function getAnswerMap(answers: FormAnswer[]): Map<string, string | number | Record<string, unknown>> {
  const m = new Map<string, string | number | Record<string, unknown>>();
  for (const a of answers) {
    const key = a.row_id === null ? `q-${a.question_id}` : `q-${a.question_id}-${a.row_id}`;
    if (a.value_text != null) m.set(key, a.value_text);
    else if (a.value_number != null) m.set(key, a.value_number);
    else if (a.value_json != null) m.set(key, a.value_json as Record<string, unknown>);
  }
  return m;
}

function buildHtml(data: {
  form: { name: string; version: string | null; unit_code: string | null; header_asset_url: string | null; cover_asset_url?: string | null };
  steps: Array<{
    step: { id: number; title: string; subtitle: string | null };
    sections: Array<{
      section: FormSection;
      questions: Array<{
        question: FormQuestion;
        options: FormQuestionOption[];
        rows: FormQuestionRow[];
      }>;
    }>;
  }>;
  answers: Map<string, string | number | Record<string, unknown>>;
}): { html: string; unitCode: string; version: string; headerHtml: string } {
  const { form, steps, answers } = data;
  let headerImg = form.header_asset_url || '';
  if (!headerImg) {
    try {
      let logoPath = path.join(__dirname, '..', 'public', 'logo.jpeg');
      if (!fs.existsSync(logoPath)) logoPath = path.join(__dirname, '..', 'public', 'logo.jpg');
      if (fs.existsSync(logoPath)) {
        const logoBuf = fs.readFileSync(logoPath);
        headerImg = `data:image/jpeg;base64,${logoBuf.toString('base64')}`;
      }
    } catch (_e) {}
  }

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 115px 15mm 70px 15mm; }
    @page :first { margin: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 9pt; margin: 0; padding: 0; color: #1f2937; box-sizing: border-box; min-height: 100%; }
    .header { position: fixed; top: 0; left: 15mm; right: 15mm; width: calc(100% - 30mm); z-index: 1000; background: #fff; padding: 16px 0 16px 0; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; border-bottom: 1px solid #9ca3af; box-sizing: border-box; overflow: visible; }
    .header-inner { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; width: 100%; gap: 16px; overflow: visible; }
    .header img { max-height: 110px; max-width: 220px; flex-shrink: 0; }
    .header-address { text-align: right; font-size: 8pt; color: #374151; line-height: 1.35; flex-shrink: 0; overflow: visible; padding-left: 12px; }
    .header-address a { color: #2563eb; text-decoration: underline; }
    .divider { height: 1px; background: #9ca3af; margin: 8px 0 14px 0; }
    h2 { font-size: 13pt; font-weight: bold; margin: 0 0 12px 0; color: #1f2937; border-left: 4px solid #9ca3af; padding-left: 8px; }
    h3 { font-size: 10pt; font-weight: bold; margin: 12px 0 6px 0; color: #1f2937; }
    .section-table { width: 100%; border-collapse: collapse; font-size: 9pt; margin: 0 0 12px 0; border: 1px solid #000; border-left: 1px solid #000 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .section-table th, .section-table td { border: 1px solid #000; padding: 10px 12px; vertical-align: middle; line-height: 1.35; overflow: visible; }
    .section-table td:first-child, .section-table th:first-child { border-left: 1px solid #000 !important; }
    .sub-section-header { background: #5E5E5E !important; color: #fff !important; font-weight: bold; font-size: 9pt; padding: 10px 12px; vertical-align: middle; }
    .label-cell { width: 35%; background: #F0F4FA; font-weight: 600; color: #374151; }
    .value-cell { width: 65%; color: #1f2937; background: #F0F4FA; }
    .row-alt .label-cell { background: #F0F4FA; }
    .row-alt .value-cell { background: #F0F4FA; }
    .row-normal .label-cell, .row-normal .value-cell { background: #F0F4FA; }
    .question { margin: 12px 0; overflow: visible; }
    .question-label { font-weight: bold; margin-bottom: 4px; overflow: visible; line-height: 1.4; }
    .decl-heading-bar { font-size: 10pt; font-weight: bold; margin: 12px 0 6px 0; color: #1f2937; border-left: 4px solid #9ca3af; padding-left: 8px; }
    .declarations-section { border: 1px solid #000; border-left: 1px solid #000 !important; padding: 12px; background: #fff; margin-bottom: 12px; }
    .declarations-section .question { margin: 10px 0; }
    .declarations-section .question:first-child { padding-top: 0; margin-top: 0; }
    .declarations-section .question-label { font-style: italic; font-weight: 500; }
    .declaration-checkbox { display: inline-flex; align-items: flex-start; gap: 10px; }
    .declaration-checkbox .cb { width: 18px; height: 18px; border: 1px solid #d1d5db; border-radius: 3px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; color: #1f2937; background: #fff; }
    .declaration-checkbox .cb.checked { color: #1f2937; }
    .assessment-submission-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; }
    .assessment-submission-item { display: inline-flex; align-items: center; gap: 8px; }
    .assessment-submission-item .cb { width: 18px; height: 18px; border: 1px solid #374151; border-radius: 3px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; color: #1f2937; background: #fff; }
    .assessment-submission-item .cb.checked { background: #1f2937; color: #fff; }
    .assessment-submission-item .question-label { font-weight: normal; font-style: normal; }
    .assessment-submission-item .cb-inline-input { border: none; border-bottom: 1px solid #333; min-width: 100px; flex: 1; background: transparent; padding: 2px 4px; font-size: 9pt; display: inline-block; }
    .assessment-submission-hint { text-align: center; font-size: 8pt; font-style: italic; color: #6b7280; margin-top: 4px; }
    .reasonable-adjustment-section { border: 1px solid #000; margin-bottom: 12px; }
    .reasonable-adjustment-header { background: #5E5E5E !important; color: #fff !important; font-weight: bold; font-size: 9pt; padding: 10px 12px; display: flex; align-items: center; gap: 8px; }
    .reasonable-adjustment-arrow { font-size: 10pt; }
    .reasonable-adjustment-body { padding: 12px; background: #fff; }
    .reasonable-adjustment-radio { display: flex; align-items: center; gap: 8px; margin: 6px 0; }
    .reasonable-adjustment-section .radio-circle { display: inline-block; width: 12px; height: 12px; border: 1.5px solid #4b5563; border-radius: 50%; }
    .reasonable-adjustment-section .radio-circle.filled { background: #1f2937; border-color: #1f2937; }
    .reasonable-adjustment-desc { min-height: 48px; }
    .reasonable-adjustment-sig-row { display: flex; align-items: center; gap: 12px; margin-top: 16px; flex-wrap: wrap; }
    .reasonable-adjustment-sig-label { font-weight: 600; }
    .reasonable-adjustment-sig-line { flex: 1; min-width: 120px; border-bottom: 1px solid #333; min-height: 20px; }
    .reasonable-adjustment-date-label { margin-left: 24px; font-weight: 600; }
    .reasonable-adjustment-date-line { flex: 1; min-width: 80px; border-bottom: 1px solid #333; min-height: 20px; }
    .decl-table { width: 100%; border-collapse: collapse; font-size: 9pt; margin: 0 0 12px 0; border: 1px solid #000; border-left: 1px solid #000 !important; }
    .decl-table td { border: 1px solid #000; padding: 10px 12px; vertical-align: middle; line-height: 1.35; overflow: visible; }
    .decl-table td:first-child { border-left: 1px solid #000 !important; }
    .decl-table .decl-label { width: 35%; background: #F0F4FA; color: #374151; }
    .decl-table .decl-value { background: #F0F4FA; color: #1f2937; }
    .decl-table .decl-sig-value { color: #2563eb; font-style: italic; text-decoration: underline; }
    .decl-table .decl-other-header { background: #5E5E5E !important; color: #fff !important; font-weight: bold; padding: 10px 12px; vertical-align: middle; }
    .decl-table .decl-office-label { font-style: italic; }
    .decl-sig-heading { font-size: 10pt; font-weight: bold; margin: 12px 0 6px 0; color: #1f2937; }
    .answer-box { border-bottom: 1px solid #333; min-height: 20px; padding: 2px 4px; overflow: visible; }
    table { width: 100%; border-collapse: collapse; font-size: 8pt; margin-bottom: 12px; }
    th, td { border: 1px solid #000; padding: 10px 12px; vertical-align: middle; line-height: 1.35; overflow: visible; }
    th { background: #5E5E5E; color: #fff; font-weight: bold; }
    tbody tr:nth-child(even) { background: #f9fafb; }
    tbody tr:nth-child(odd) { background: #fff; }
    .likert-table { width: 100%; border-collapse: collapse; font-size: 9pt; margin: 0 0 12px 0; border: 1px solid #000; border-left: 1px solid #000 !important; }
    .likert-table th, .likert-table td { border: 1px solid #000; padding: 10px 12px; vertical-align: middle; line-height: 1.35; overflow: visible; }
    .likert-table th:first-child, .likert-table td:first-child { border-left: 1px solid #000 !important; }
    .likert-header { background: #5E5E5E !important; color: #fff !important; font-weight: bold; }
    .likert-no { width: 48px; min-width: 48px; text-align: center; font-weight: 600; vertical-align: middle; }
    .likert-criteria { font-weight: 600; vertical-align: middle; }
    .likert-scale { min-width: 32px; width: 32px; height: 140px; padding: 12px 6px; overflow: visible; font-size: 9pt; box-sizing: border-box; vertical-align: middle; }
    .likert-scale-inner { display: flex; align-items: center; justify-content: center; width: 100%; min-height: 100%; overflow: visible; }
    .likert-scale-inner span { display: inline-block; transform: rotate(-90deg); transform-origin: center center; white-space: nowrap; line-height: 1.2; }
    .likert-section-row td { background: #5E5E5E !important; color: #fff !important; font-weight: bold; font-size: 9pt; }
    .likert-table tbody .likert-no { background: #e5e7eb !important; color: #1f2937; }
    .likert-table tbody .likert-criteria { background: #e5e7eb !important; color: #1f2937; }
    .likert-table tbody .row-alt .likert-no { background: #f3f4f6 !important; }
    .likert-table tbody .row-alt .likert-criteria { background: #f3f4f6 !important; }
    .likert-radio { text-align: center; background: #fff !important; }
    .likert-table tbody .row-alt .likert-radio { background: #f9fafb !important; }
    .radio-circle { display: inline-block; width: 12px; height: 12px; border: 1.5px solid #4b5563; border-radius: 50%; }
    .radio-circle.filled { background: #1f2937; border-color: #1f2937; }
    .signature-img { max-width: 150px; max-height: 60px; }
    .step-page { page-break-after: always; }
    .section-table, .likert-table, .decl-table, .assessment-tasks-table { page-break-inside: auto; }
    .step-page:first-child { padding-top: 20px; }
    .step-page:not(:first-child) { padding-top: 24px; }
    .intro-page h2.intro-title { font-size: 18pt; font-weight: bold; margin: 0 0 16px 0; color: #1f2937; border-left: none; padding-left: 0; }
    .intro-page h3 { font-size: 12pt; font-weight: bold; margin: 16px 0 8px 0; color: #1f2937; }
    .intro-page h4 { font-size: 10pt; font-weight: bold; margin: 12px 0 6px 0; color: #1f2937; }
    .intro-page p { margin: 0 0 12px 0; line-height: 1.5; }
    .intro-page ul { margin: 0 0 12px 0; padding-left: 20px; }
    .intro-page li { margin-bottom: 6px; line-height: 1.5; }
    .step-page:last-child { page-break-after: auto; }
    /* Prevent awkward breaks that could push content into footer */
    p, .intro-page p, .declarations-section { orphans: 2; widows: 2; }
    /* COVER PAGE ONLY */
    .cover-page{
      position: relative;
      z-index: 1001;
      width: 210mm;
      height: 297mm;
      page-break-after: always;
      overflow: visible;
      background: #b0b8c0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      margin: 0;
    }

    /* hero image area */
    .cover-image{
      position:absolute;
      top:0; left:0; right:0;
      height: 260mm;
      background-size: cover;
      background-position: center;
      background-repeat:no-repeat;
      z-index: 1;
    }

    /* logo on top-left */
    .cover-logo{
      position:absolute;
      top: 12mm;
      left: 12mm;
      z-index: 6;
    }
    .cover-logo img{
      max-height: 85px;
      max-width: 150px;
      display:block;
    }

    /* STUDENT WORKBOOK band (overlay on image) */
    .cover-band{
      position:absolute;
      left:0; right:0;
      top: 114mm;
      height: 18mm;
      background: #9ca3af;
      border-top: 2px solid #fff;
      border-bottom: 2px solid #fff;
      display:flex;
      align-items:center;
      justify-content:center;
      z-index: 5;
    }
    .cover-band h1{
      margin:0;
      font-size: 22pt;
      font-weight: 800;
      color: #1a3a5c;
      letter-spacing: 0.14em;
    }

    /* WAVE sits ON TOP of image and visually becomes the "cut" */
    .cover-wave{
      position:absolute;
      left:0; right:0;
      top: 155mm;
      height: 55mm;
      z-index: 4;
      pointer-events:none;
    }
    .cover-wave svg{
      width:100%;
      height:100%;
      display:block;
    }

    /* grey area must START EXACTLY at the same top as wave container,
      wave path itself fills grey so there is NO seam line */
    .cover-grey{
      position:absolute;
      left:0; right:0;
      top: 210mm;
      bottom:0;
      background:#b0b8c0;
      z-index: 2;
    }
    /* unit text in grey area - single line, no background on code */
    .cover-unit{
      position:absolute;
      left: 15mm; right: 15mm;
      top: 225mm;
      text-align:center;
      z-index: 7;
    }
    .cover-unit-text{
      font-size: 17pt;
      font-weight: 800;
      color:#fff;
      line-height: 1.2;
    }

    /* student table box */
    .cover-student-box{
      position:absolute;
      left: 15mm; right: 15mm;
      bottom: 18mm;
      background:#fff;
      border: 1px solid #000;
      z-index: 7;
    }
    .cover-student-table{
      width:100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 11pt;
    }
    .cover-student-table td{
      border: 1px solid #000;
      padding: 6px 10px;
      vertical-align: middle;
    }
    .cover-student-label{
      width: 42mm;
      background:#e5e7eb;
      font-weight: 800;
    }
    .cover-student-line{
      display:inline-block;
      width: 100%;
      border-bottom: 1px solid #000;
      min-height: 14px;
    }

  </style>
</head>
<body>
`;

  // Group steps: put Student & Trainer + Qualification & Unit on the same page
  const isStudentTrainerStep = (s: { title: string }) => /student/i.test(s.title) && /trainer/i.test(s.title);
  const isQualificationStep = (s: { title: string }) => /qualification/i.test(s.title);
  const pageGroups: Array<typeof steps> = [];
  for (let i = 0; i < steps.length; i++) {
    const curr = steps[i];
    const next = steps[i + 1];
    if (next && isStudentTrainerStep(curr.step) && isQualificationStep(next.step)) {
      pageGroups.push([curr, next]);
      i++;
    } else {
      pageGroups.push([curr]);
    }
  }

  const codeToValue = new Map<string, string | number | Record<string, unknown>>();
  for (const g of pageGroups) {
    for (const { sections } of g) {
      for (const { questions } of sections) {
        for (const { question } of questions) {
          if (question.code) {
            const v = answers.get(`q-${question.id}`);
            if (v != null) codeToValue.set(question.code, v);
          }
        }
      }
    }
  }

  const unitCode = String(codeToValue.get('unit.code') ?? form.unit_code ?? '');
  const unitTitle = String(codeToValue.get('unit.name') ?? codeToValue.get('qualification.name') ?? '');
  const studentName = String(codeToValue.get('student.fullName') ?? '');
  const studentId = String(codeToValue.get('student.id') ?? '');
  const coverImg = (form as { cover_asset_url?: string | null }).cover_asset_url || '';

  const coverImageStyle = coverImg ? `background-image:url('${coverImg}')` : 'background:linear-gradient(180deg,#5a6a7a 0%,#3d4a5a 100%)';

  const unitText = [unitCode || 'Unit Code', unitTitle || form.name || 'Unit Title'].filter(Boolean).join(' ');

  const headerHtml = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;width:100%;padding:12px 15mm;font-family:Arial,sans-serif;font-size:8pt;color:#374151;box-sizing:border-box;">
      <div style="flex-shrink:0;">${headerImg ? `<img src="${headerImg}" alt="Skyline" style="max-height:85px;max-width:200px;" />` : ''}</div>
      <div style="text-align:right;line-height:1.35;flex-shrink:0;padding-left:12px;">
        Level 8, 310 King Street<br/>Melbourne VIC – 3000<br/>RTO: 45989 CRICOS: 04114B<br/>Email: <a href="mailto:info@slit.edu.au" style="color:#2563eb;text-decoration:underline;">info@slit.edu.au</a><br/>Phone: +61 3 9125 1661
      </div>
    </div>
  `;

  html += `<div class="cover-page">
  <div class="cover-image" style="${coverImageStyle}"></div>

  <div class="cover-logo">
    ${headerImg ? `<img src="${headerImg}" alt="Skyline" />` : ''}
  </div>

  <div class="cover-band"><h1>STUDENT WORKBOOK</h1></div>

  <div class="cover-grey"></div>

  <div class="cover-wave">
    <svg viewBox="0 0 1200 300" preserveAspectRatio="none">
      <path fill="#b0b8c0"
        d="M0,70
          C300,70 350,240 600,230
          C850,240 1150,70 1200,70
          L1200,300 L0,300 Z"/>
      </svg>
  </div>

  <div class="cover-unit">
    <div class="cover-unit-text">${unitText}</div>
  </div>

  <div class="cover-student-box">
    <table class="cover-student-table">
      <tr>
        <td class="cover-student-label">Student Name:</td>
        <td><span class="cover-student-line">${studentName || ''}</span></td>
      </tr>
      <tr>
        <td class="cover-student-label">Student ID:</td>
        <td><span class="cover-student-line">${studentId || ''}</span></td>
      </tr>
    </table>
  </div>
</div>
`;

  // Introduction page (before student details) - shown in every form
  html += `<div class="step-page intro-page">
  <h2 class="intro-title">Student Pack</h2>
  <h3>What is the purpose of this document?</h3>
  <p>The Student Pack is the document you, the student, needs to complete to demonstrate competency. This document includes the context and conditions of your assessment, the tasks to be completed by you and an outline of the evidence to be gathered.</p>
  <h4>The information includes the following:</h4>
  <ul>
    <li>Information related to the unit of competency.</li>
    <li>Guidelines and instructions to complete each task and activity.</li>
    <li>A student evaluation form</li>
  </ul>
  <h4>Student Evaluation Form</h4>
  <p>These documents are designed after conducting thorough industry consultation. Students are encouraged to evaluate this document and provide constructive feedback to their training organisation if they feel that this document can be improved.</p>
  <h4>Link to other unit documents</h4>
  <ul>
    <li>The Student Pack is a document for students to complete to demonstrate their competency. This document includes context and conditions of assessment, tasks to be administered to the student, and an outline of the evidence to be gathered from the student.</li>
    <li>The Unit Mapping is a document that contains information and comprehensive mapping with the training package requirements.</li>
  </ul>
</div>
`;

  let headerNum = 1;
  for (const group of pageGroups) {
    html += `<div class="step-page">`;
    for (const { sections } of group) {
      for (const { section, questions } of sections) {
      if (section.pdf_render_mode !== 'declarations' && section.pdf_render_mode !== 'reasonable_adjustment') {
        html += `<h3>${headerNum}. ${section.title}</h3>`;
        headerNum++;
        if (section.description) html += `<p>${section.description}</p>`;
      }
      if (section.pdf_render_mode === 'reasonable_adjustment') {
        headerNum++;
      }

      if (section.pdf_render_mode === 'likert_table') {

        const scaleLabels = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
        html += '<table class="likert-table"><thead><tr>';
        html += '<th class="likert-header likert-no">No.</th><th class="likert-header likert-criteria">Criteria/Question</th>';
        for (const lbl of scaleLabels) html += `<th class="likert-header likert-scale"><div class="likert-scale-inner"><span>${lbl}</span></div></th>`;
        html += '</tr><tr class="likert-section-row">';
        html += `<td class="likert-no"></td><td colspan="6" class="likert-section-title">${section.title}</td>`;
        html += '</tr></thead><tbody>';
        let rowNum = 1;
        for (const { question, rows } of questions) {
          for (const row of rows) {
            const key = `q-${question.id}-${row.id}`;
            const val = answers.get(key);
            const sel = val != null ? String(val) : '';
            const rowClass = rowNum % 2 === 0 ? 'row-alt' : 'row-normal';
            html += `<tr class="${rowClass}"><td class="likert-no">${rowNum}</td><td class="likert-criteria">${row.row_label}</td>`;
            for (let i = 1; i <= 5; i++) {
              const filled = sel === String(i);
              html += `<td class="likert-radio"><span class="radio-circle${filled ? ' filled' : ''}"></span></td>`;
            }
            html += '</tr>';
            rowNum++;
          }
        }
        html += '</tbody></table>';
      } else if (section.pdf_render_mode === 'grid_table') {
        const cols = (questions[0]?.question?.pdf_meta?.columns as string[]) || ['Column 1', 'Column 2'];
        html += '<table><thead><tr><th>Shape</th>';
        for (const c of cols) html += `<th>${c}</th>`;
        html += '</tr></thead><tbody>';
        for (const { question, rows } of questions) {
          for (const row of rows) {
            const key = `q-${question.id}-${row.id}`;
            const val = answers.get(key) as Record<string, string> | undefined;
            html += '<tr>';
            html += `<td>${row.row_image_url ? `<img src="${row.row_image_url}" class="signature-img" alt="" />` : ''}<br>${row.row_label}</td>`;
            for (let i = 0; i < cols.length; i++) {
              const cellVal = val && typeof val === 'object' ? (val[`r${row.id}_c${i}`] || '') : '';
              html += `<td>${cellVal}</td>`;
            }
            html += '</tr>';
          }
        }
        html += '</tbody></table>';
      } else if (section.pdf_render_mode === 'assessment_tasks') {
        const taskQuestion = questions.find((q) => q.question.type === 'grid_table' && q.rows.length > 0);
        if (taskQuestion) {
          html += '<table class="section-table assessment-tasks-table">';
          html += '<thead><tr><th class="sub-section-header">Evidence number</th><th class="sub-section-header">Assessment method/ Type of evidence</th></tr></thead><tbody>';
          let rowIdx = 0;
          for (const row of taskQuestion.rows) {
            const rowClass = rowIdx++ % 2 === 0 ? 'row-normal' : 'row-alt';
            const methodText = (row.row_help || '').replace(/\n/g, '<br/>');
            html += `<tr class="${rowClass}"><td class="label-cell">${row.row_label}</td><td class="value-cell">${methodText}</td></tr>`;
          }
          html += '</tbody></table>';
        }
      } else if (section.pdf_render_mode === 'assessment_submission') {
        const multiChoice = questions.find((q) => q.question.type === 'multi_choice');
        const otherDescQ = questions.find((q) => q.question.type === 'short_text');
        const otherDescVal = otherDescQ ? String(answers.get(`q-${otherDescQ.question.id}`) ?? '') : '';
        const mcVal = multiChoice ? answers.get(`q-${multiChoice.question.id}`) : undefined;
        const selected = new Set(Array.isArray(mcVal) ? (mcVal as string[]) : []);
        const opts = multiChoice?.options ?? [];
        html += '<div class="declarations-section">';
        html += '<div class="assessment-submission-grid">';
        for (let i = 0; i < opts.length; i++) {
          const opt = opts[i];
          const checked = selected.has(opt.value);
          const isOther = opt.value === 'other';
          html += '<div class="assessment-submission-item">';
          html += `<span class="cb ${checked ? 'checked' : ''}">${checked ? '✓' : ''}</span>`;
          html += `<span class="question-label">${opt.label}</span>`;
          if (isOther) {
            html += `<span class="cb-inline-input">${otherDescVal}</span>`;
          }
          html += '</div>';
        }
        html += '</div>';
        html += '<div class="assessment-submission-hint">(Please describe here)</div>';
        html += '</div>';
      } else if (section.pdf_render_mode === 'reasonable_adjustment') {
        const yesNoQ = questions.find((q) => q.question.type === 'yes_no');
        const taskQ = questions.find((q) => q.question.code === 'reasonable_adjustment.task');
        const descQ = questions.find((q) => q.question.code === 'reasonable_adjustment.description');
        const sigQ = questions.find((q) => q.question.type === 'signature');
        const appliedVal = yesNoQ ? String(answers.get(`q-${yesNoQ.question.id}`) ?? '') : '';
        const taskVal = taskQ ? String(answers.get(`q-${taskQ.question.id}`) ?? '') : '';
        const descVal = descQ ? String(answers.get(`q-${descQ.question.id}`) ?? '') : '';
        const yesChecked = appliedVal.toLowerCase() === 'yes' || appliedVal === 'true';
        const noChecked = appliedVal.toLowerCase() === 'no' || appliedVal === 'false' || (!yesChecked && appliedVal !== '');
        let sigVal: string | null = null;
        let dateVal = '';
        if (sigQ) {
          const v = answers.get(`q-${sigQ.question.id}`);
          if (v && typeof v === 'object' && !Array.isArray(v)) {
            const o = v as Record<string, unknown>;
            sigVal = typeof o.signature === 'string' ? o.signature : (typeof o.imageDataUrl === 'string' ? o.imageDataUrl : null);
            dateVal = String(o.date ?? o.signedAtDate ?? '');
          } else if (typeof v === 'string' && v.startsWith('data:')) {
            sigVal = v;
          }
        }
        const sigDisplay = sigVal ? `<img src="${sigVal}" class="signature-img" alt="Signature" />` : '';
        html += '<div class="reasonable-adjustment-section">';
        html += '<div class="reasonable-adjustment-header"><span class="reasonable-adjustment-arrow">&#9654;</span> Reasonable Adjustment</div>';
        html += '<div class="reasonable-adjustment-body">';
        html += `<div class="question"><div class="question-label">${yesNoQ?.question.label || 'Was reasonable adjustment applied to any of these assessment tasks?'}</div>`;
        html += '<div class="reasonable-adjustment-radio"><span class="radio-circle' + (yesChecked ? ' filled' : '') + '"></span> Yes</div>';
        html += '<div class="reasonable-adjustment-radio"><span class="radio-circle' + (noChecked ? ' filled' : '') + '"></span> No</div></div>';
        html += `<div class="question"><div class="question-label">${taskQ?.question.label || 'If yes, which assessment task was this applied to?'}</div><div class="answer-box">${taskVal}</div></div>`;
        html += `<div class="question"><div class="question-label">${descQ?.question.label || 'Provide a description of the adjustment applied and explain reasons.'}</div><div class="answer-box reasonable-adjustment-desc">${descVal}</div></div>`;
        html += '<div class="reasonable-adjustment-sig-row"><span class="reasonable-adjustment-sig-label">Trainer Signature:</span><span class="reasonable-adjustment-sig-line">' + sigDisplay + '</span><span class="reasonable-adjustment-date-label">Date:</span><span class="reasonable-adjustment-date-line">' + dateVal + '</span></div>';
        html += '</div></div>';
      } else if (section.pdf_render_mode === 'declarations') {
        const sectionTitle = section.title.toLowerCase();
        if (sectionTitle.includes('final declaration')) {
          html += `<div class="decl-heading-bar">${headerNum}. ${section.title}</div>`;
          headerNum++;
          html += '<div class="declarations-section">';
          for (const { question, options } of questions) {
            if (question.type === 'yes_no' || question.type === 'single_choice') {
              const key = `q-${question.id}`;
              const val = answers.get(key);
              const checked = String(val || '').toLowerCase() === 'yes' || String(val || '').toLowerCase() === 'true';
              html += `<div class="question declaration-checkbox"><span class="cb ${checked ? 'checked' : ''}">${checked ? '✓' : ''}</span><span class="question-label">${question.label}</span></div>`;
            }
          }
          html += '</div>';
        } else if (sectionTitle.includes('signature')) {
          for (const { question } of questions) {
            if (question.type === 'signature') {
              const code = question.code || '';
              const val = answers.get(`q-${question.id}`);
              const pm = (question.pdf_meta as Record<string, unknown>) || {};
              const showName = pm.showNameField !== false;
              const showDate = pm.showDateField !== false;
              let nameVal = '';
              let sigVal: string | null = null;
              let dateVal = '';
              if (val && typeof val === 'object' && !Array.isArray(val)) {
                const o = val as Record<string, unknown>;
                nameVal = String(o.name ?? o.fullName ?? codeToValue.get(code.startsWith('student') ? 'student.fullName' : 'trainer.fullName') ?? '');
                sigVal = typeof o.signature === 'string' ? o.signature : (typeof o.imageDataUrl === 'string' ? o.imageDataUrl : null);
                dateVal = String(o.date ?? o.signedAtDate ?? '');
              } else if (typeof val === 'string' && val.startsWith('data:')) {
                sigVal = val;
                nameVal = String(codeToValue.get(code.startsWith('student') ? 'student.fullName' : 'trainer.fullName') ?? '');
              }
              const sigDisplay = sigVal
                ? `<img src="${sigVal}" class="signature-img" alt="Signature" />`
                : `<span class="decl-sig-value">${nameVal || '-'}</span>`;
              html += `<div class="decl-sig-heading">${question.label}</div>`;
              html += '<table class="decl-table"><tbody>';
              if (showName) html += `<tr><td class="decl-label">${code.startsWith('student') ? 'Student Name' : 'Trainer/Assessor Name'}</td><td class="decl-value">${nameVal || ''}</td></tr>`;
              html += `<tr><td class="decl-label">${question.label}</td><td class="decl-value">${sigDisplay}</td></tr>`;
              if (showDate) html += `<tr><td class="decl-label">Date</td><td class="decl-value">${dateVal || ''}</td></tr>`;
              html += '</tbody></table>';
            }
          }
        } else if (sectionTitle.includes('office')) {
          html += `<div class="decl-heading-bar">${headerNum}. ${section.title}</div>`;
          headerNum++;
          html += '<table class="decl-table"><tbody>';
          html += '<tr><td colspan="2" class="decl-other-header">Other</td></tr>';
          for (const { question } of questions) {
            const key = `q-${question.id}`;
            const val = answers.get(key);
            const label = question.label;
            html += `<tr><td class="decl-label decl-office-label">${label}</td><td class="decl-value">${val ?? ''}</td></tr>`;
          }
          html += '</tbody></table>';
        } else {
          html += `<h3>${headerNum}. ${section.title}</h3>`;
          headerNum++;
          if (section.description) html += `<p class="intro-page" style="margin: 0 0 12px 0; line-height: 1.5;">${(section.description || '').replace(/\n/g, '<br/>')}</p>`;
          html += '<div class="declarations-section">';
          for (const { question } of questions) {
            if (question.type === 'signature') {
              const code = question.code || '';
              const val = answers.get(`q-${question.id}`);
              const pm = (question.pdf_meta as Record<string, unknown>) || {};
              const showName = pm.showNameField !== false;
              const showDate = pm.showDateField !== false;
              let nameVal = '';
              let sigVal: string | null = null;
              let dateVal = '';
              if (val && typeof val === 'object' && !Array.isArray(val)) {
                const o = val as Record<string, unknown>;
                nameVal = String(o.name ?? o.fullName ?? codeToValue.get(code.startsWith('student') ? 'student.fullName' : 'trainer.fullName') ?? '');
                sigVal = typeof o.signature === 'string' ? o.signature : (typeof o.imageDataUrl === 'string' ? o.imageDataUrl : null);
                dateVal = String(o.date ?? o.signedAtDate ?? '');
              } else if (typeof val === 'string' && val.startsWith('data:')) {
                sigVal = val;
                nameVal = String(codeToValue.get(code.startsWith('student') ? 'student.fullName' : 'trainer.fullName') ?? '');
              }
              const sigDisplay = sigVal
                ? `<img src="${sigVal}" class="signature-img" alt="Signature" />`
                : `<span class="decl-sig-value">${nameVal || '-'}</span>`;
              html += `<div class="decl-sig-heading">${question.label}</div>`;
              html += '<table class="decl-table"><tbody>';
              if (showName) html += `<tr><td class="decl-label">${code.startsWith('student') ? 'Student Name' : 'Trainer/Assessor Name'}</td><td class="decl-value">${nameVal || ''}</td></tr>`;
              html += `<tr><td class="decl-label">${question.label}</td><td class="decl-value">${sigDisplay}</td></tr>`;
              if (showDate) html += `<tr><td class="decl-label">Date</td><td class="decl-value">${dateVal || ''}</td></tr>`;
              html += '</tbody></table>';
            } else if (question.type === 'date') {
              const val = answers.get(`q-${question.id}`);
              html += `<div class="question"><div class="question-label">${question.label}</div><div class="answer-box">${val ?? ''}</div></div>`;
            } else if (question.type === 'yes_no' || question.type === 'single_choice') {
              const val = answers.get(`q-${question.id}`);
              const checked = String(val || '').toLowerCase() === 'yes' || String(val || '').toLowerCase() === 'true';
              html += `<div class="question declaration-checkbox"><span class="cb ${checked ? 'checked' : ''}">${checked ? '✓' : ''}</span><span class="question-label">${question.label}</span></div>`;
            } else {
              const val = answers.get(`q-${question.id}`);
              html += `<div class="question"><div class="question-label">${question.label}</div><div class="answer-box">${val ?? ''}</div></div>`;
            }
          }
          html += '</div>';
        }
      } else {
        const instructionBlocks = questions.filter((q) => q.question.type === 'instruction_block');
        for (const { question } of instructionBlocks) {
          if (question.help_text) {
            html += `<div class="intro-page" style="margin: 0 0 12px 0; line-height: 1.5;">${(question.help_text || '').replace(/\n/g, '<br/>')}</div>`;
          }
        }
        const normalQuestions = questions.filter(
          (q) => q.question.type !== 'instruction_block' && q.question.type !== 'page_break'
        );
        if (normalQuestions.length > 0) {
          const groupNames: Record<string, string> = {
            student: 'Student details',
            trainer: 'Trainer details',
            qualification: 'Qualification/Course/Program Details',
            unit: 'Unit of competency',
            office: 'Office Use Only',
          };
          const groups: Record<string, typeof normalQuestions> = {};
          for (const q of normalQuestions) {
            const prefix = (q.question.code || '').split('.')[0] || 'other';
            const groupKey = groupNames[prefix] || 'Other';
            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(q);
          }
          html += '<table class="section-table">';
          let rowIdx = 0;
          for (const [groupName, groupQs] of Object.entries(groups)) {
            html += `<tr><td colspan="2" class="sub-section-header">${groupName}</td></tr>`;
            for (const { question, rows } of groupQs) {
              const key = rows[0] ? `q-${question.id}-${rows[0].id}` : `q-${question.id}`;
              const val = answers.get(key);
              const rowClass = rowIdx++ % 2 === 0 ? 'row-normal' : 'row-alt';
              html += `<tr class="${rowClass}"><td class="label-cell">${question.label}</td><td class="value-cell">${val ?? ''}</td></tr>`;
            }
          }
          html += '</table>';
        }
      }
    }
  }
  html += `</div>`;
  }

  html += `
  </div>
</body>
</html>`;

  const version = form.version || '1';
  return { html, unitCode, version, headerHtml };
}

app.get('/pdf/:instanceId', async (req, res) => {
  const instanceId = Number(req.params.instanceId);
  const download = req.query.download === '1';

  if (!instanceId) {
    res.status(400).send('Invalid instance ID');
    return;
  }

  try {
    const template = await getTemplateForInstance(instanceId);
    if (!template) {
      res.status(404).send('Instance not found');
      return;
    }

    const { data: answers } = await supabase
      .from('skyline_form_answers')
      .select('*')
      .eq('instance_id', instanceId);

    const answerMap = getAnswerMap((answers as FormAnswer[]) || []);

    const form = template.instance.form as { name: string; version: string | null; unit_code: string | null; header_asset_url: string | null; cover_asset_url?: string | null };
    const { html, unitCode, version, headerHtml } = buildHtml({
      form,
      steps: template.steps,
      answers: answerMap,
    });
    const footerHtml = `
      <div style="font-size: 9pt; color: #374151; width: 100%; height: 50px; display: flex; justify-content: space-between; align-items: center; padding: 0 15mm; box-sizing: border-box;">
        <span>Version Number: ${version}</span>
        <span>Unit Code: ${unitCode || ''}</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `;

    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });

    // Cover page (page 1): no footer - hide version, unit code, page number
    const coverPdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      displayHeaderFooter: false,
      pageRanges: '1',
    });

    let pdf: Buffer;
    const restPdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '115px', right: '15mm', bottom: '70px', left: '15mm' },
      displayHeaderFooter: true,
      headerTemplate: headerHtml,
      footerTemplate: footerHtml,
      pageRanges: '2-',
    });

    await browser.close();

    // Merge: cover (no footer) + rest (with footer)
    const mergedPdf = await PDFDocument.create();
    const coverDoc = await PDFDocument.load(coverPdf);
    const [coverPage] = await mergedPdf.copyPages(coverDoc, [0]);
    mergedPdf.addPage(coverPage);

    const restDoc = await PDFDocument.load(restPdf);
    const restPageCount = restDoc.getPageCount();
    if (restPageCount > 0) {
      for (let i = 0; i < restPageCount; i++) {
        const [p] = await mergedPdf.copyPages(restDoc, [i]);
        mergedPdf.addPage(p);
      }
    }

    pdf = Buffer.from(await mergedPdf.save());

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    if (download) {
      res.setHeader('Content-Disposition', `attachment; filename="form-${instanceId}.pdf"`);
    }
    res.send(pdf);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).send('Failed to generate PDF');
  }
});

app.listen(PORT, () => {
  console.log(`PDF server running on http://localhost:${PORT}`);
});
