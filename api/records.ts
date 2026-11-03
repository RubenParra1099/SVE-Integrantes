import { neon } from '@neondatabase/serverless';
import { createHash, timingSafeEqual } from 'crypto';
import { parseRegistro } from '../src/config/validation.js';

const sha256 = (value: string) => createHash('sha256').update(value).digest();

// Vercel Serverless Function: /api/records (requiere Authorization: Bearer <ADMIN_PASSWORD>)
//   GET   → lista de registros
//   PATCH → edita un registro ({ folio, nombreCompleto, edad, sexo, telefono, comunidad })
export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET' && req.method !== 'PATCH') {
    res.setHeader('Allow', 'GET, PATCH');
    return res.status(405).json({ status: 'error', message: 'Método no permitido' });
  }

  const databaseUrl = process.env.DATABASE_URL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!databaseUrl || !adminPassword) {
    return res.status(500).json({ status: 'error', message: 'Faltan DATABASE_URL o ADMIN_PASSWORD en el servidor.' });
  }

  const auth = String(req.headers?.authorization ?? '');
  const provided = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!provided || !timingSafeEqual(sha256(provided), sha256(adminPassword))) {
    // Pequeña pausa para frenar intentos de adivinar la contraseña
    await new Promise((resolve) => setTimeout(resolve, 800));
    return res.status(401).json({ status: 'error', message: 'Contraseña incorrecta.' });
  }

  const sql = neon(databaseUrl);

  if (req.method === 'PATCH') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const folio = String(body.folio ?? '').trim();
    const input = parseRegistro(body);
    if (!folio || !input) {
      return res.status(400).json({ status: 'error', message: 'Datos inválidos. Revisa los campos.' });
    }

    try {
      const rows = await sql`
        UPDATE integrantes
        SET nombre_completo = ${input.nombre}, edad = ${input.edad}, sexo = ${input.sexo},
            telefono = ${input.telefono}, comunidad = ${input.comunidad}
        WHERE folio = ${folio}
        RETURNING folio, nombre_completo, edad, sexo, telefono, comunidad,
                  to_char(registrado_en AT TIME ZONE 'America/Mexico_City', 'YYYY-MM-DD HH24:MI') AS registrado_cdmx
      `;
      if (rows.length === 0) {
        return res.status(404).json({ status: 'error', message: `No existe el registro ${folio}.` });
      }
      return res.status(200).json({ status: 'success', data: rows[0] });
    } catch (error) {
      console.error('Error al actualizar en Neon:', error);
      return res.status(500).json({ status: 'error', message: 'No se pudo guardar el cambio.' });
    }
  }

  try {
    const rows = await sql`
      SELECT folio, nombre_completo, edad, sexo, telefono, comunidad,
             to_char(registrado_en AT TIME ZONE 'America/Mexico_City', 'YYYY-MM-DD HH24:MI') AS registrado_cdmx
      FROM integrantes
      ORDER BY registrado_en DESC
    `;
    return res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error al leer de Neon:', error);
    return res.status(500).json({ status: 'error', message: 'No se pudieron obtener los registros.' });
  }
}
