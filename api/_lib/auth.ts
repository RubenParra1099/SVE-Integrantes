import { createHash, timingSafeEqual } from 'crypto';

const sha256 = (value: string) => createHash('sha256').update(value).digest();

// Revisa Authorization: Bearer <ADMIN_PASSWORD>. Si falla, responde 401 y devuelve false.
export async function requireAdmin(req: any, res: any, adminPassword: string): Promise<boolean> {
  const auth = String(req.headers?.authorization ?? '');
  const provided = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (provided && timingSafeEqual(sha256(provided), sha256(adminPassword))) return true;

  // Pequeña pausa para frenar intentos de adivinar la contraseña
  await new Promise((resolve) => setTimeout(resolve, 800));
  res.status(401).json({ status: 'error', message: 'Contraseña incorrecta.' });
  return false;
}
