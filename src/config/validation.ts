import { COMMUNITIES } from './communities.js';
import { normalizePhone } from './phone.js';

export interface RegistroInput {
  nombre: string;
  edad: number;
  sexo: string;
  telefono: string;
  comunidad: string;
}

// Valida los datos de un registro en el servidor (alta en /api/register y edición en /api/records)
export function parseRegistro(body: any): RegistroInput | null {
  const nombre = String(body?.nombreCompleto ?? '').trim();
  const edad = parseInt(String(body?.edad ?? ''), 10);
  const sexo = String(body?.sexo ?? '');
  const telefono = normalizePhone(body?.telefono);
  const comunidad = String(body?.comunidad ?? '').trim();

  if (
    !(COMMUNITIES as readonly string[]).includes(comunidad) ||
    nombre.length < 3 ||
    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(nombre) ||
    isNaN(edad) || edad < 10 || edad > 99 ||
    !['Masculino', 'Femenino'].includes(sexo) ||
    telefono.length !== 10
  ) {
    return null;
  }

  return { nombre, edad, sexo, telefono, comunidad };
}
