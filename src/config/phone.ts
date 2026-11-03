// Normaliza un teléfono de México a 10 dígitos: quita espacios, guiones y la lada +52 (o +521).
// Ej. "+52 871 133 3316" → "8711333316"
export function normalizePhone(raw: string): string {
  const digits = String(raw ?? '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('52')) return digits.slice(2);
  if (digits.length === 13 && digits.startsWith('521')) return digits.slice(3);
  return digits;
}

export const isValidPhone = (raw: string): boolean => normalizePhone(raw).length === 10;
