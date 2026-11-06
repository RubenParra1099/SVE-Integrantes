import { COMMUNITIES } from '../config/communities';

// Lista de comunidades guardada en la base de datos (se edita desde /admin).
// Si el servidor no responde, se usa la lista inicial del código.
export async function fetchCommunities(): Promise<string[]> {
  try {
    const response = await fetch('/api/communities');
    const result = await response.json().catch(() => null);
    if (response.ok && result?.status === 'success' && Array.isArray(result.data)) return result.data;
  } catch {
    // Sin conexión: se usa la lista inicial
  }
  return [...COMMUNITIES];
}
