export type Gender = 'Masculino' | 'Femenino';

export interface RegistrationFormData {
  fullName: string;
  age: string;
  gender: Gender | '';
  phone: string;
}

export interface RegistrationRecord extends RegistrationFormData {
  id: string;
  registeredAt: string;
}

export interface FormErrors {
  fullName?: string;
  age?: string;
  gender?: string;
  phone?: string;
}

export type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';
