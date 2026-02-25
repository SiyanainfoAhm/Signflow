/**
 * Appendix A - Reasonable Adjustment Strategies Matrix structure.
 * Shared structure for form UI and PDF generation (pdf-server has its own copy).
 * Each checkbox has a unique id; stored value is Record<id, boolean>.
 */
export interface MatrixItem {
  id: string;
  label: string;
}

/** Table 1: Category | Possible Issue | Reasonable Adjustment Strategy */
export const APPENDIX_A_TABLE1: {
  category: MatrixItem;
  issues: MatrixItem[];
  strategies: MatrixItem[];
}[] = [
  {
    category: { id: 'ra_lln', label: 'LLN' },
    issues: [
      { id: 'ra_lln_speaking', label: 'Speaking' },
      { id: 'ra_lln_reading', label: 'Reading' },
      { id: 'ra_lln_writing', label: 'Writing' },
      { id: 'ra_lln_confidence', label: 'Confidence' },
    ],
    strategies: [
      { id: 'ra_lln_verbal_assessment', label: 'Verbal assessment' },
      { id: 'ra_lln_presentations', label: 'Presentations' },
      { id: 'ra_lln_demonstration', label: 'Demonstration of a skill' },
      { id: 'ra_lln_diagrams', label: 'Use of diagrams' },
      { id: 'ra_lln_wordlists', label: 'Use of supporting documents such as wordlists' },
    ],
  },
  {
    category: { id: 'ra_nesb', label: 'Non-English Speaking Background' },
    issues: [
      { id: 'ra_nesb_speaking', label: 'Speaking' },
      { id: 'ra_nesb_reading', label: 'Reading' },
      { id: 'ra_nesb_writing', label: 'Writing' },
      { id: 'ra_nesb_cultural', label: 'Cultural background' },
      { id: 'ra_nesb_confidence', label: 'Confidence' },
    ],
    strategies: [
      { id: 'ra_nesb_discuss_lln', label: 'Discuss with the student and Supervisor (if applicable) whether language, literacy and numeracy are likely to impact on the assessment process' },
      { id: 'ra_nesb_methods_no_higher', label: 'Use methods that do not require a higher level of language or literacy than is required to perform the job role' },
      { id: 'ra_nesb_short_sentences', label: 'Use short sentences that do not contain large amounts of information' },
      { id: 'ra_nesb_rephrase', label: 'Clarify information by rephrasing, confirm understanding' },
      { id: 'ra_nesb_read_printed', label: 'Read any printed information to the student' },
      { id: 'ra_nesb_graphics', label: 'Use graphics, pictures and colour coding instead of, or to support, text' },
      { id: 'ra_nesb_write_oral', label: 'Offer to write down, or have someone else write, oral responses given by the student' },
      { id: 'ra_nesb_time_available', label: "Ensure that the time available to complete the assessment, while meeting enterprise requirements, takes account of the student's needs" },
    ],
  },
];

/** Table 2: Category | Reasonable Adjustment Strategy */
export const APPENDIX_A_TABLE2: {
  categoryItems: MatrixItem[];
  strategies: MatrixItem[];
}[] = [
  {
    categoryItems: [
      { id: 'ra_indigenous', label: 'Indigenous – Knowledge and understanding' },
      { id: 'ra_indigenous_flexibility', label: 'Flexibility' },
      { id: 'ra_indigenous_services', label: 'Services' },
      { id: 'ra_indigenous_inappropriate', label: 'Inappropriate training and assessment' },
    ],
    strategies: [
      { id: 'ra_indigenous_culturally_appropriate', label: 'Culturally appropriate training' },
      { id: 'ra_indigenous_oral_assessment', label: 'Explore understanding of concepts and practical application through oral assessment' },
      { id: 'ra_indigenous_flexible_delivery', label: 'Flexible delivery' },
      { id: 'ra_indigenous_group_assessments', label: 'Using group rather than individual assessments' },
      { id: 'ra_indigenous_practical_tasks', label: 'Assessment through completion of practical tasks in the field after demonstration of skills and knowledge.' },
    ],
  },
  {
    categoryItems: [
      { id: 'ra_age', label: 'Age – Educational background' },
      { id: 'ra_age_limited_study', label: 'Limited study skills' },
    ],
    strategies: [
      { id: 'ra_age_font_size', label: 'Make sure font size is not too small' },
      { id: 'ra_age_student_experience', label: "Trainer/Assessor should refer to the student's experience" },
      { id: 'ra_age_time_assessment', label: "Ensure that the time available to complete the assessment takes account of the student's needs" },
      { id: 'ra_age_accessible_format', label: 'Provision of information or course materials in an accessible format.' },
      { id: 'ra_age_fm_microphone', label: 'Changes in teaching practices, e.g. wearing an FM microphone to enable a student to hear lectures' },
      { id: 'ra_age_note_taker', label: 'Supply of specialised equipment or services, e.g. a note-taker for a student who cannot write' },
      { id: 'ra_age_venue', label: 'Changes in lecture schedules and arrangements, e.g. relocating classes to an accessible venue' },
      { id: 'ra_age_substitute_task', label: 'Changes to course design, e.g. substituting an assessment task' },
      { id: 'ra_age_physical_env', label: 'Modifications to the physical environment, e.g. installing lever taps, building ramps, installing a lift' },
    ],
  },
  {
    categoryItems: [
      { id: 'ra_edu_reading', label: 'Educational background – Reading' },
      { id: 'ra_edu_writing', label: 'Writing' },
      { id: 'ra_edu_numeracy', label: 'Numeracy' },
      { id: 'ra_edu_limited_skills', label: 'Limited study skills and/or learning strategies' },
    ],
    strategies: [
      { id: 'ra_edu_previous_learning', label: 'Discuss with the Student previous learning experience' },
      { id: 'ra_edu_individual_need', label: 'Ensure learning and assessment methods meet the student\'s individual need' },
    ],
  },
  {
    categoryItems: [
      { id: 'ra_disability_speaking', label: 'Disability – Speaking' },
      { id: 'ra_disability_reading', label: 'Reading' },
      { id: 'ra_disability_writing', label: 'Writing' },
      { id: 'ra_disability_numeracy', label: 'Numeracy' },
      { id: 'ra_disability_limited_skills', label: 'Limited study skills and/or learning strategies' },
    ],
    strategies: [
      { id: 'ra_disability_identify', label: 'Identify the issues' },
      { id: 'ra_disability_climate', label: 'Create a climate of support' },
      { id: 'ra_disability_access_support', label: 'Ensure access to support that the student has agreed to' },
      { id: 'ra_disability_structure', label: 'Appropriately structure the assessment' },
      { id: 'ra_disability_braille', label: 'Provide information or course materials in an accessible format, e.g. a textbook in braille' },
      { id: 'ra_disability_fm_microphone', label: 'Changes in teaching practices, e.g. wearing an FM microphone to enable a student to hear lectures' },
      { id: 'ra_disability_note_taker', label: 'Supply of specialised equipment or services, e.g. a note-taker for a student who cannot write' },
      { id: 'ra_disability_venue', label: 'Changes in lecture schedules and arrangements, e.g. relocating classes to an accessible venue' },
      { id: 'ra_disability_substitute_task', label: 'Changes to course design, e.g. substituting an assessment task' },
      { id: 'ra_disability_physical_env', label: 'Modifications to the physical environment, e.g. installing lever taps, building ramps, installing a lift' },
    ],
  },
];

export type AppendixAMatrixValue = Record<string, boolean>;
