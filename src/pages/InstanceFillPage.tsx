import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchTemplateForInstance,
  fetchAnswersForInstance,
  fetchInstance,
  saveAnswer,
  updateInstanceRole,
} from '../lib/formEngine';
import type { FormTemplate } from '../lib/formEngine';
import type { FormAnswer } from '../types/database';
import type { FormRole } from '../utils/roleGuard';
import { isRoleVisible, isRoleEditable } from '../utils/roleGuard';
import { Card } from '../components/ui/Card';
import { Loader } from '../components/ui/Loader';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Stepper } from '../components/ui/Stepper';
import { QuestionRenderer } from '../components/form-fill/QuestionRenderer';
import { SectionLikertTable } from '../components/form-fill/SectionLikertTable';

const PDF_BASE = import.meta.env.VITE_PDF_API_URL ?? '';

function getAnswerKey(questionId: number, rowId: number | null): string {
  if (rowId === null) return `q-${questionId}`;
  return `q-${questionId}-${rowId}`;
}

function parseAnswerValue(a: FormAnswer): string | number | boolean | Record<string, unknown> | null {
  if (a.value_text) return a.value_text;
  if (a.value_number != null) return a.value_number;
  if (a.value_json) return a.value_json as Record<string, unknown>;
  return null;
}

export const InstanceFillPage: React.FC = () => {
  const { instanceId } = useParams<{ instanceId: string }>();
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | number | boolean | Record<string, unknown> | string[]>>({});
  const [role, setRole] = useState<FormRole>('student');
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errors] = useState<Record<string, string>>({});
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const id = instanceId ? Number(instanceId) : 0;
  const [pdfRefresh, setPdfRefresh] = useState(0);
  const pdfCacheBust = useMemo(() => Date.now(), [id, pdfRefresh]);

  const loadData = useCallback(async () => {
    if (!id) return;
    const [tpl, ans, inst] = await Promise.all([
      fetchTemplateForInstance(id),
      fetchAnswersForInstance(id),
      fetchInstance(id),
    ]);
    setTemplate(tpl || null);
    const roleCtx = (inst?.role_context as FormRole) || 'student';
    setRole(roleCtx);
    const ansMap: Record<string, string | number | boolean | Record<string, unknown>> = {};
    for (const a of ans) {
      const key = getAnswerKey(a.question_id, a.row_id);
      ansMap[key] = parseAnswerValue(a) as string | number | boolean | Record<string, unknown>;
    }
    setAnswers(ansMap);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const debouncedSave = useCallback(
    (questionId: number, rowId: number | null, value: string | number | boolean | Record<string, unknown> | string[]) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        let text: string | undefined;
        let num: number | undefined;
        let json: unknown;
        if (typeof value === 'string') text = value;
        else if (typeof value === 'number') num = value;
        else if (typeof value === 'boolean') text = value ? 'true' : 'false';
        else if (Array.isArray(value)) json = value;
        else if (value && typeof value === 'object') json = value;
        await saveAnswer(id, questionId, rowId, { text, number: num, json });
      }, 300);
    },
    [id]
  );

  const handleAnswerChange = useCallback(
    (questionId: number, rowId: number | null, value: string | number | boolean | Record<string, unknown> | string[]) => {
      const key = getAnswerKey(questionId, rowId);
      setAnswers((prev) => ({ ...prev, [key]: value }));
      debouncedSave(questionId, rowId, value);
    },
    [debouncedSave]
  );

  const handleRoleChange = useCallback(
    (newRole: FormRole) => {
      setRole(newRole);
      updateInstanceRole(id, newRole);
    },
    [id]
  );

  if (loading || !template) {
    return <Loader fullPage variant="dots" size="lg" message="Loading..." />;
  }

  // Introduction step is always first, then form steps
  const steps = [
    { number: 1, label: 'Introduction', description: 'Student Pack overview' },
    ...template.steps.map((s, i) => ({
      number: i + 2,
      label: s.title,
      description: s.subtitle || '',
    })),
  ];

  const isIntroductionStep = currentStep === 1;
  const currentStepData = isIntroductionStep ? null : template.steps[currentStep - 2];
  const visibleQuestions: { q: typeof template.steps[0]['sections'][0]['questions'][0]; section: typeof template.steps[0]['sections'][0] }[] = [];

  if (currentStepData) {
    for (const section of currentStepData.sections) {
      for (const q of section.questions) {
        const rv = (q.role_visibility as Record<string, boolean>) || {};
        if (isRoleVisible(rv, role)) {
          visibleQuestions.push({ q, section });
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="bg-white border-b border-[var(--border)] shadow-sm sticky top-0 z-20">
        <div className="w-full px-4 md:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-xl font-bold text-[var(--text)]">{template.form.name}</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Role:</span>
              <Select
                value={role}
                onChange={(v) => handleRoleChange(v as FormRole)}
                options={[
                  { value: 'student', label: 'Student' },
                  { value: 'trainer', label: 'Trainer' },
                  { value: 'office', label: 'Office' },
                ]}
                className="w-32"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)] pr-2">
            <Card>
              <Stepper steps={steps} currentStep={currentStep} />
            </Card>

            {isIntroductionStep ? (
              <Card>
                <h2 className="text-xl font-bold text-[var(--text)] mb-4">Student Pack</h2>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">What is the purpose of this document?</h3>
                <p className="text-gray-700 mb-4">
                  The Student Pack is the document you, the student, needs to complete to demonstrate competency. This document includes the context and conditions of your assessment, the tasks to be completed by you and an outline of the evidence to be gathered.
                </p>
                <h4 className="font-semibold text-gray-700 mb-2">The information includes the following:</h4>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Information related to the unit of competency.</li>
                  <li>Guidelines and instructions to complete each task and activity.</li>
                  <li>A student evaluation form</li>
                </ul>
                <h4 className="font-semibold text-gray-700 mb-2">Student Evaluation Form</h4>
                <p className="text-gray-700 mb-4">
                  These documents are designed after conducting thorough industry consultation. Students are encouraged to evaluate this document and provide constructive feedback to their training organisation if they feel that this document can be improved.
                </p>
                <h4 className="font-semibold text-gray-700 mb-2">Link to other unit documents</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>The Student Pack is a document for students to complete to demonstrate their competency. This document includes context and conditions of assessment, tasks to be administered to the student, and an outline of the evidence to be gathered from the student.</li>
                  <li>The Unit Mapping is a document that contains information and comprehensive mapping with the training package requirements.</li>
                </ul>
              </Card>
            ) : currentStepData ? (
              <Card>
                <h2 className="text-xl font-bold text-[var(--text)] mb-4">
                  Step {currentStep}: {currentStepData.title}
                </h2>
                {currentStepData.sections
                  .filter((section) => {
                    const hasInteractive = section.questions.some(
                      (q) => q.type !== 'instruction_block' && isRoleVisible((q.role_visibility as Record<string, boolean>) || {}, role)
                    );
                    return hasInteractive || section.pdf_render_mode === 'assessment_tasks' || section.pdf_render_mode === 'assessment_submission' || section.pdf_render_mode === 'reasonable_adjustment';
                  })
                  .map((section) => (
                  <div key={section.id} className="mb-8 last:mb-0">
                    {section.pdf_render_mode !== 'likert_table' && section.pdf_render_mode !== 'reasonable_adjustment' && (
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">{section.title}</h3>
                    )}
                    <div className={section.pdf_render_mode === 'declarations' || section.pdf_render_mode === 'assessment_submission' ? 'border border-gray-200 rounded-lg p-4 bg-white space-y-4' : 'space-y-4'}>
                      {section.pdf_render_mode === 'reasonable_adjustment' ? (
                        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                          <div className="bg-[#5E5E5E] text-white font-bold px-4 py-3 flex items-center gap-2">
                            <span className="text-sm">&#9654;</span>
                            <span>Reasonable Adjustment</span>
                          </div>
                          <div className="p-4 space-y-4">
                            {section.questions
                              .filter((q) => isRoleVisible((q.role_visibility as Record<string, boolean>) || {}, role))
                              .map((q) => {
                                const re = (q.role_editability as Record<string, boolean>) || {};
                                const editable = isRoleEditable(re, role);
                                const key = getAnswerKey(q.id, null);
                                const val = answers[key];
                                if (q.type === 'yes_no') {
                                  return (
                                    <QuestionRenderer
                                      key={q.id}
                                      question={q}
                                      value={(val as string | number | boolean) ?? null}
                                      onChange={(v) => handleAnswerChange(q.id, null, v as string | number | boolean)}
                                      disabled={!editable}
                                      error={errors[`q-${q.id}`]}
                                    />
                                  );
                                }
                                if (q.code === 'reasonable_adjustment.task') {
                                  return (
                                    <QuestionRenderer
                                      key={q.id}
                                      question={q}
                                      value={(val as string) ?? null}
                                      onChange={(v) => handleAnswerChange(q.id, null, v as string)}
                                      disabled={!editable}
                                      error={errors[`q-${q.id}`]}
                                    />
                                  );
                                }
                                if (q.type === 'long_text') {
                                  return (
                                    <QuestionRenderer
                                      key={q.id}
                                      question={q}
                                      value={(val as string) ?? null}
                                      onChange={(v) => handleAnswerChange(q.id, null, v as string)}
                                      disabled={!editable}
                                      error={errors[`q-${q.id}`]}
                                    />
                                  );
                                }
                                if (q.type === 'signature') {
                                  const sigVal = val;
                                  const sigObj = sigVal && typeof sigVal === 'object' && !Array.isArray(sigVal) ? (sigVal as Record<string, unknown>) : null;
                                  const dateVal = sigObj ? String(sigObj.date ?? sigObj.signedAtDate ?? '') : '';
                                  const imgVal = sigObj?.signature ?? sigObj?.imageDataUrl ?? (typeof sigVal === 'string' ? sigVal : null);
                                  return (
                                    <div key={q.id} className="flex items-center gap-4 flex-wrap pt-2">
                                      <div className="flex-1 min-w-[200px]">
                                        <QuestionRenderer
                                          question={q}
                                          value={(imgVal as string | null) ?? null}
                                          onChange={(v) => {
                                            const img = typeof v === 'string' ? v : null;
                                            const base = (sigObj && typeof sigObj === 'object' ? { ...sigObj } : {}) as Record<string, unknown>;
                                            const merged = img != null ? { ...base, signature: img } : { ...base, signature: null };
                                            handleAnswerChange(q.id, null, merged as string | number | boolean | Record<string, unknown> | string[]);
                                          }}
                                          disabled={!editable}
                                          error={errors[`q-${q.id}`]}
                                        />
                                      </div>
                                      <div className="flex items-center gap-2 min-w-[140px]">
                                        <span className="text-sm font-semibold text-gray-700">Date:</span>
                                        <input
                                          type="date"
                                          value={dateVal}
                                          onChange={(e) => {
                                            const newDate = e.target.value;
                                            const base = sigObj || (typeof sigVal === 'string' ? { signature: sigVal } : {});
                                            handleAnswerChange(q.id, null, { ...base, date: newDate } as string | number | boolean | Record<string, unknown> | string[]);
                                          }}
                                          disabled={!editable}
                                          className="border border-gray-300 rounded px-2 py-1.5 text-sm"
                                        />
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              })}
                          </div>
                        </div>
                      ) : section.pdf_render_mode === 'assessment_tasks' ? (
                        (() => {
                          const taskQ = section.questions.find((q) => q.type === 'grid_table' && q.rows.length > 0);
                          if (!taskQ) return null;
                          return (
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse border border-black text-sm">
                                <thead>
                                  <tr>
                                    <th className="bg-[#5E5E5E] text-white font-bold p-3 text-left border border-black">Evidence number</th>
                                    <th className="bg-[#5E5E5E] text-white font-bold p-3 text-left border border-black">Assessment method/ Type of evidence</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {taskQ.rows.map((row, i) => (
                                    <tr key={row.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F0F4FA]'}>
                                      <td className="p-3 font-semibold border border-black">{row.row_label}</td>
                                      <td className="p-3 border border-black whitespace-pre-line">{row.row_help || ''}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          );
                        })()
                      ) : section.pdf_render_mode === 'assessment_submission' ? (
                        <div className="space-y-3">
                          {section.questions
                            .filter((q) => isRoleVisible((q.role_visibility as Record<string, boolean>) || {}, role))
                            .map((q) =>
                              q.type === 'multi_choice' ? (
                                <div key={q.id} className="space-y-2">
                                  {q.options?.map((opt) => (
                                    <div key={opt.id} className="flex items-center gap-2">
                                      <div className="w-5 h-5 border-2 border-gray-400 rounded flex items-center justify-center bg-gray-100">
                                        <span className="text-gray-400 text-xs">☐</span>
                                      </div>
                                      <span className="text-gray-700">{opt.label}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : q.type === 'short_text' ? (
                                <div key={q.id}>
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="w-5 h-5 border-2 border-gray-400 rounded flex items-center justify-center bg-gray-100">
                                      <span className="text-gray-400 text-xs">☐</span>
                                    </div>
                                    <span className="text-gray-700 font-medium">{q.label}</span>
                                  </div>
                                  <div className="ml-7 border-b border-gray-400 border-dashed min-h-[24px] text-gray-500" />
                                </div>
                              ) : null
                            )}
                        </div>
                      ) : section.pdf_render_mode === 'likert_table' ? (
                        <>
                          <SectionLikertTable
                            section={section}
                            getAnswer={(qId, rId) => {
                              const v = answers[getAnswerKey(qId, rId)];
                              return v != null ? String(v) : null;
                            }}
                            onChange={(qId, rId, val) => handleAnswerChange(qId, rId, val)}
                            disabled={!section.questions.some((q) =>
                              isRoleEditable((q.role_editability as Record<string, boolean>) || {}, role)
                            )}
                          />
                          {section.questions
                            .filter((q) => q.type !== 'likert_5' && isRoleVisible((q.role_visibility as Record<string, boolean>) || {}, role))
                            .map((q) => {
                              const re = (q.role_editability as Record<string, boolean>) || {};
                              const editable = isRoleEditable(re, role);
                              const key = getAnswerKey(q.id, null);
                              const val = answers[key];
                              return (
                                <QuestionRenderer
                                  key={q.id}
                                  question={q}
                                  value={(val as string | number | boolean | Record<string, unknown> | string[]) ?? null}
                                  onChange={(v) => handleAnswerChange(q.id, null, v as string | number | boolean | Record<string, unknown> | string[])}
                                  disabled={!editable}
                                  error={errors[`q-${q.id}`]}
                                  declarationStyle={section.pdf_render_mode === 'declarations'}
                                />
                              );
                            })}
                        </>
                      ) : (
                        section.questions
                        .filter((q) => q.type !== 'instruction_block' && isRoleVisible((q.role_visibility as Record<string, boolean>) || {}, role))
                        .map((q) => {
                          const re = (q.role_editability as Record<string, boolean>) || {};
                          const editable = isRoleEditable(re, role);
                          if (q.type === 'likert_5' && q.rows.length > 0) {
                            const val =
                              q.rows.length === 1
                                ? (answers[getAnswerKey(q.id, q.rows[0].id)] as string) ?? null
                                : (() => {
                                    const m: Record<string, string> = {};
                                    for (const r of q.rows) {
                                      const v = answers[getAnswerKey(q.id, r.id)];
                                      if (v != null) m[`row-${r.id}`] = String(v);
                                    }
                                    return Object.keys(m).length ? m : null;
                                  })();
                            const onLikertChange = (v: string | number | boolean | Record<string, unknown> | string[]) => {
                              if (q.rows.length === 1) {
                                handleAnswerChange(q.id, q.rows[0].id, typeof v === 'string' ? v : String(v));
                              } else {
                                const o = v as Record<string, string>;
                                if (o && typeof o === 'object') {
                                  for (const r of q.rows) {
                                    const rv = o[`row-${r.id}`];
                                    if (rv != null) handleAnswerChange(q.id, r.id, rv);
                                  }
                                }
                              }
                            };
                            return (
                              <QuestionRenderer
                                key={q.id}
                                question={q}
                                value={val}
                                onChange={onLikertChange}
                                disabled={!editable}
                                error={errors[`q-${q.id}`]}
                              />
                            );
                          }
                          if (q.type === 'grid_table' && q.rows.length > 0) {
                            const merged: Record<string, string> = {};
                            for (const r of q.rows) {
                              const v = answers[getAnswerKey(q.id, r.id)];
                              if (v && typeof v === 'object') Object.assign(merged, v as Record<string, string>);
                            }
                            const onGridChange = (v: string | number | boolean | Record<string, unknown> | string[]) => {
                              const byRow = new Map<number, Record<string, string>>();
                              const o = v as Record<string, string>;
                              if (!o || typeof o !== 'object') return;
                              for (const [k, val] of Object.entries(o)) {
                                const match = /^r(\d+)_c/.exec(k);
                                if (match) {
                                  const rowId = Number(match[1]);
                                  if (!byRow.has(rowId)) byRow.set(rowId, {});
                                  byRow.get(rowId)![k] = String(val);
                                }
                              }
                              for (const [rowId, rowData] of byRow.entries()) {
                                handleAnswerChange(q.id, rowId, rowData);
                              }
                            };
                            return (
                              <QuestionRenderer
                                key={q.id}
                                question={q}
                                value={Object.keys(merged).length ? merged : null}
                                onChange={onGridChange}
                                disabled={!editable}
                                error={errors[`q-${q.id}`]}
                              />
                            );
                          }
                          const key = getAnswerKey(q.id, null);
                          const val = answers[key];
                          return (
                            <QuestionRenderer
                              key={q.id}
                              question={q}
                              value={(val as string | number | boolean | Record<string, unknown> | string[]) ?? null}
                              onChange={(v) => handleAnswerChange(q.id, null, v as string | number | boolean | Record<string, unknown> | string[])}
                              disabled={!editable}
                              error={errors[`q-${q.id}`]}
                              declarationStyle={section.pdf_render_mode === 'declarations'}
                            />
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </Card>
            ) : null}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                disabled={currentStep <= 1}
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setCurrentStep((s) => Math.min(steps.length, s + 1))}
                disabled={currentStep >= steps.length}
              >
                Next
              </Button>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-4">
              <Card>
                <h3 className="font-bold text-[var(--text)] mb-4">PDF Preview</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      window.open(`${PDF_BASE}/pdf/${id}?t=${pdfCacheBust}`, '_blank', 'width=800,height=600');
                    }}
                  >
                    Preview PDF
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => setPdfRefresh((r) => r + 1)}
                  >
                    Refresh PDF
                  </Button>
                  <a
                    href={`${PDF_BASE}/pdf/${id}?download=1&t=${pdfCacheBust}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      Download PDF
                    </Button>
                  </a>
                </div>
                <div className="mt-4">
                  <iframe
                    key={pdfCacheBust}
                    src={`${PDF_BASE}/pdf/${id}?t=${pdfCacheBust}`}
                    title="PDF Preview"
                    className="w-full h-96 border border-[var(--border)] rounded"
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
