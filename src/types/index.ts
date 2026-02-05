export type Role = 'student' | 'trainer' | 'office';

export type RoleScope = 'student' | 'trainer' | 'both' | 'office';

export interface SignatureData {
  imageDataUrl: string | null;
  signedAtDate: string | null;
}

export interface FormAnswers {
  [fieldId: string]: any;
}

export interface FormState {
  role: Role;
  studentSignature: SignatureData;
  trainerSignature: SignatureData;
  answers: FormAnswers;
  studentSubmitted: boolean;
  trainerSubmitted: boolean;
}

