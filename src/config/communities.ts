// Lista inicial de comunidades. La lista vigente vive en la tabla `comunidades` (se edita desde /admin);
// esta se usa para llenarla la primera vez y como respaldo si el servidor no responde.
export const COMMUNITIES = [
  'San Pedro Apóstol en San Pedro de las Colonias',
  'San Marcos',
  'San Miguel Arcángel',
  'San Pablo Apóstol',
  'Santa Cecilia',
  'San José Obrero',
  'Equipo Diocesano',
  'San Juan Bautista',
  'Santa María del Milagro de Caná',
  'Centro Saulo',
  'San Rafael Arcángel',
  'San Martín de Porres',
  'San Felipe de Jesús',
  'San Juan de los Lagos (San Pedro)',
  'Sagrado Corazón de Jesús (Fco. I. Madero)',
  'Ntra. Sra. de Lourdes',
  'San Juan de los Lagos (Torreón)',
  'Parroquia de Todos los Santos',
] as const;

// Valor del menú para "mi comunidad no aparece": se pide escribir el nombre a mano.
export const OTHER_COMMUNITY = '__otra__';

// Limpia el nombre de una comunidad (quita espacios sobrantes).
export function cleanCommunity(value: unknown): string {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

// Acepta comunidades de la lista oficial o nuevas escritas a mano (3 a 100 caracteres).
export function isValidCommunity(value: string): boolean {
  return value !== OTHER_COMMUNITY && value.length >= 3 && value.length <= 100;
}
