import React, { useState, useMemo } from 'react';
import { useFormStore } from '../store/formStore';
import { FormDefinition } from '../types/formDefinition';
import { FormPage } from './FormPage';
import { Role } from '../types';
import { Stepper } from '../components/ui/Stepper';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { PdfPreviewCard } from '../components/PdfPreviewCard';
import formDefinitionData from '../data/formDefinition.json';

export const FormView: React.FC = () => {
  const formDefinition = formDefinitionData as FormDefinition;
  const {
    role,
    answers,
    studentSubmitted,
    trainerSubmitted,
    setRole,
    setStudentSubmitted,
    setTrainerSubmitted,
  } = useFormStore();

  const [activePageIndex, setActivePageIndex] = useState(0);
  const activePage = formDefinition.pages[activePageIndex];

  // Create steps from pages
  const steps = useMemo(() => {
    return formDefinition.pages.map((page, index) => {
      const firstSection = page.sections[0];
      const sectionTitle =
        firstSection && 'title' in firstSection
          ? firstSection.title
          : firstSection && 'label' in firstSection
          ? firstSection.label
          : `Page ${page.pageNumber}`;
      return {
        number: index + 1,
        label: `Page ${page.pageNumber}`,
        description: sectionTitle,
      };
    });
  }, [formDefinition.pages]);

  // Calculate completion percent
  const completionPercent = useMemo(() => {
    const totalFields = formDefinition.pages.reduce((acc, page) => {
      return (
        acc +
        page.sections.reduce((sectionAcc, section) => {
          if (section.type === 'detailsTable') {
            return sectionAcc + section.fields.length;
          } else if (section.type === 'likertMatrix') {
            return sectionAcc + section.questions.length;
          } else if (section.type === 'textarea') {
            return sectionAcc + 1;
          } else if (section.type === 'checkboxGroup') {
            return sectionAcc + section.options.length;
          } else if (section.type === 'signatureBlock') {
            return sectionAcc + 1;
          }
          return sectionAcc;
        }, 0)
      );
    }, 0);

    const filledFields = Object.keys(answers).filter((key) => {
      const value = answers[key];
      return value !== '' && value !== null && value !== undefined;
    }).length;

    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  }, [answers, formDefinition.pages]);


  const handleNext = () => {
    if (activePageIndex < formDefinition.pages.length - 1) {
      setActivePageIndex(activePageIndex + 1);
    }
  };

  const handleBack = () => {
    if (activePageIndex > 0) {
      setActivePageIndex(activePageIndex - 1);
    }
  };

  const handleSaveDraft = () => {
    // Draft is auto-saved via Zustand persist middleware
    alert('Draft saved to localStorage');
  };

  const handleSubmit = () => {
    if (role === 'student' && !studentSubmitted) {
      if (window.confirm('Are you sure you want to submit? This will lock your section.')) {
        setStudentSubmitted(true);
        alert('Student section submitted and locked.');
      }
    } else if (role === 'trainer' && !trainerSubmitted) {
      if (window.confirm('Are you sure you want to submit? This will lock your section.')) {
        setTrainerSubmitted(true);
        alert('Trainer section submitted and locked.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Bar */}
        <div className="bg-white p-4 mb-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-700">Role:</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="h-11 px-4 rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--brand)] focus:border-[var(--brand)] font-medium text-gray-700 bg-white shadow-sm transition-all"
              >
                <option value="student">Student</option>
                <option value="trainer">Trainer</option>
                <option value="office">Office</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleSaveDraft}>
                Save Draft
              </Button>
              {role !== 'office' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={
                    (role === 'student' && studentSubmitted) ||
                    (role === 'trainer' && trainerSubmitted)
                  }
                >
                  {role === 'student' && studentSubmitted
                    ? 'Student Section Submitted'
                    : role === 'trainer' && trainerSubmitted
                    ? 'Trainer Section Submitted'
                    : 'Submit (Lock Section)'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left: Wizard */}
          <div className="col-span-12 lg:col-span-7">
            <Card>
              {/* Stepper */}
              <Stepper steps={steps} currentStep={activePageIndex + 1} />

              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-semibold text-[var(--brand)]">
                    {completionPercent}%
                  </span>
                </div>
                <Progress value={completionPercent} />
              </div>

              {/* Active Page */}
              <div className="mb-6">
                <FormPage formDefinition={formDefinition} page={activePage} />
              </div>

              {/* Navigation Bar (Sticky Bottom) */}
              <div className="sticky bottom-0 bg-white border-t border-[var(--border)] -mx-6 -mb-6 px-6 py-4 rounded-b-2xl">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Step {activePageIndex + 1} of {formDefinition.pages.length}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      disabled={activePageIndex === 0}
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleNext}
                      disabled={activePageIndex === formDefinition.pages.length - 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: PDF Preview */}
          <div className="col-span-12 lg:col-span-5">
            <PdfPreviewCard role={role} />
          </div>
        </div>
      </div>
    </div>
  );
};

