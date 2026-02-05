import { RoleScope } from './index';

export interface FormMeta {
  title: string;
  orgName: string;
  orgAddress: string;
  version: string;
}

export interface DetailsTableField {
  fieldId: string;
  label: string;
  roleScope: RoleScope;
  type: 'text' | 'email' | 'number' | 'date';
}

export interface DetailsTableSection {
  type: 'detailsTable';
  title: string;
  fields: DetailsTableField[];
}

export interface LikertQuestion {
  fieldId: string;
  question: string;
  roleScope: RoleScope;
}

export interface LikertMatrixSection {
  type: 'likertMatrix';
  title: string;
  questions: LikertQuestion[];
  scaleLabels: string[];
}

export interface TextareaSection {
  type: 'textarea';
  fieldId: string;
  label: string;
  roleScope: RoleScope;
  rows?: number;
}

export interface CheckboxOption {
  fieldId: string;
  label: string;
  roleScope: RoleScope;
}

export interface CheckboxGroupSection {
  type: 'checkboxGroup';
  title: string;
  options: CheckboxOption[];
}

export interface SignatureBlockSection {
  type: 'signatureBlock';
  fieldId: string;
  label: string;
  roleScope: RoleScope;
  showNameField?: boolean;
  showDateField?: boolean;
}

export type FormSection =
  | DetailsTableSection
  | LikertMatrixSection
  | TextareaSection
  | CheckboxGroupSection
  | SignatureBlockSection;

export interface FormPage {
  pageNumber: number;
  sections: FormSection[];
}

export interface FormDefinition {
  meta: FormMeta;
  pages: FormPage[];
}

