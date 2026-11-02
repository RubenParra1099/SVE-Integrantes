import { RegistrationFormData } from '../types';

export interface SubmitResponse {
  success: boolean;
  id?: string;
  message?: string;
  registeredAt?: string;
}

export async function submitRegistration(formData: RegistrationFormData): Promise<SubmitResponse> {
  const payload = {
    nombreCompleto: formData.fullName.trim(),
    edad: formData.age.trim(),
    sexo: formData.gender,
    telefono: formData.phone.trim(),
  };

  let response: Response;
  try {
    response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.');
  }

  const result = await response.json().catch(() => null);
  if (!response.ok || !result || result.status !== 'success') {
    throw new Error(result?.message || `Error en el servidor (${response.status})`);
  }

  return {
    success: true,
    id: result.id,
    message: result.message,
    registeredAt: result.data?.fechaRegistro,
  };
}
