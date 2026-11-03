export type Gender = 'Masculino' | 'Femenino';

export interface RegistrationFormData {
  fullName: string;
  age: string;
  gender: Gender | '';
  phone: string;
  community: string;
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
  community?: string;
}

// Registro tal como lo devuelve /api/records (página /admin)
export interface AdminRecord {
  folio: string;
  nombre_completo: string;
  edad: number;
  sexo: string;
  telefono: string;
  comunidad: string | null;
  registrado_cdmx: string;
}

export type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';
