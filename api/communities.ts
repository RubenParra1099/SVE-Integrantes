import { neon } from '@neondatabase/serverless';
import { cleanCommunity, isValidCommunity } from '../src/config/communities.js';
import { requireAdmin } from './_lib/auth.js';
import { Sql, withTable } from './_lib/communitiesTable.js';

const listNames = async (sql: Sql): Promise<string[]> => {
  const rows = (await sql`SELECT nombre FROM comunidades ORDER BY id`) as { nombre: string }[];
  return rows.map((r) => r.nombre);
};

// Vercel Serverless Function: /api/communities
//   GET    → lista de comunidades (pública, la usa el formulario)
//   Con Authorization: Bearer <ADMIN_PASSWORD>:
//   POST   { nombre }     → agrega una comunidad
//   PATCH  { from, to }   → renombra (también en los registros); si "to" ya existe, las une
//   DELETE ?nombre=...    → quita la comunidad de la lista (los registros no cambian)
export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');

  if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
    return res.status(405).json({ status: 'error', message: 'Método no permitido' });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return res.status(500).json({ status: 'error', message: 'DATABASE_URL no está configurada en el servidor.' });
  }
  const sql = neon(databaseUrl);

  if (req.method === 'GET') {
    try {
      const data = await withTable(sql, () => listNames(sql));
      return res.status(200).json({ status: 'success', data });
    } catch (error) {
      console.error('Error al leer comunidades:', error);
      return res.status(500).json({ status: 'error', message: 'No se pudieron obtener las comunidades.' });
    }
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return res.status(500).json({ status: 'error', message: 'Falta ADMIN_PASSWORD en el servidor.' });
  }
  if (!(await requireAdmin(req, res, adminPassword))) return;

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

  try {
    if (req.method === 'POST') {
      const nombre = cleanCommunity(body.nombre);
      if (!isValidCommunity(nombre)) {
        return res.status(400).json({ status: 'error', message: 'El nombre debe tener entre 3 y 100 caracteres.' });
      }
      const rows = await withTable(sql, () =>
        sql`INSERT INTO comunidades (nombre) VALUES (${nombre}) ON CONFLICT (nombre) DO NOTHING RETURNING nombre`
      ) as unknown[];
      if (rows.length === 0) {
        return res.status(409).json({ status: 'error', message: `"${nombre}" ya está en la lista.` });
      }
      return res.status(200).json({ status: 'success', data: await listNames(sql) });
    }

    if (req.method === 'PATCH') {
      const from = cleanCommunity(body.from);
      const to = cleanCommunity(body.to);
      if (!from || !isValidCommunity(to)) {
        return res.status(400).json({ status: 'error', message: 'El nombre debe tener entre 3 y 100 caracteres.' });
      }
      if (from === to) {
        return res.status(200).json({ status: 'success', data: await withTable(sql, () => listNames(sql)), updatedRecords: 0 });
      }
      const [updated] = await withTable(sql, () =>
        sql.transaction([
          sql`UPDATE integrantes SET comunidad = ${to} WHERE comunidad = ${from} RETURNING folio`,
          // Si el nombre nuevo ya está en la lista, se unen: se quita el viejo
          sql`DELETE FROM comunidades WHERE nombre = ${from} AND EXISTS (SELECT 1 FROM comunidades WHERE nombre = ${to})`,
          sql`UPDATE comunidades SET nombre = ${to} WHERE nombre = ${from}`,
        ])
      ) as unknown[][];
      return res.status(200).json({ status: 'success', data: await listNames(sql), updatedRecords: updated.length });
    }

    // DELETE
    const nombre = cleanCommunity(req.query?.nombre);
    const rows = await withTable(sql, () =>
      sql`DELETE FROM comunidades WHERE nombre = ${nombre} RETURNING nombre`
    ) as unknown[];
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: `"${nombre}" no está en la lista.` });
    }
    return res.status(200).json({ status: 'success', data: await listNames(sql) });
  } catch (error) {
    console.error('Error al editar comunidades:', error);
    return res.status(500).json({ status: 'error', message: 'No se pudo guardar el cambio en las comunidades.' });
  }
}
