import { neon } from '@neondatabase/serverless';
import { parseRegistro } from '../src/config/validation.js';
import { withTable } from './_lib/communitiesTable.js';

// Vercel Serverless Function: POST /api/register
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ status: 'error', message: 'Método no permitido' });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return res.status(500).json({ status: 'error', message: 'DATABASE_URL no está configurada en el servidor.' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const input = parseRegistro(body);
  if (!input) {
    return res.status(400).json({ status: 'error', message: 'Datos de registro inválidos.' });
  }
  const { nombre, edad, sexo, telefono } = input;
  let { comunidad } = input;

  try {
    const sql = neon(databaseUrl);

    // Comunidad nueva escrita a mano: si ya existe con otras mayúsculas se usa ese nombre;
    // si no, se agrega a la lista para que aparezca en el menú. Si esto falla, el registro sigue.
    try {
      const existing = (await withTable(sql, () =>
        sql`SELECT nombre FROM comunidades WHERE lower(nombre) = lower(${comunidad}) LIMIT 1`
      )) as { nombre: string }[];
      if (existing.length > 0) {
        comunidad = existing[0].nombre;
      } else {
        await sql`INSERT INTO comunidades (nombre) VALUES (${comunidad}) ON CONFLICT (nombre) DO NOTHING`;
      }
    } catch (error) {
      console.error('No se pudo agregar la comunidad a la lista:', error);
    }

    const rows = await sql`
      INSERT INTO integrantes (nombre_completo, edad, sexo, telefono, comunidad)
      VALUES (${nombre}, ${edad}, ${sexo}, ${telefono}, ${comunidad})
      RETURNING folio, registrado_en
    `;
    const { folio, registrado_en } = rows[0];

    const fechaRegistro = new Intl.DateTimeFormat('es-MX', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(registrado_en));

    return res.status(200).json({
      status: 'success',
      id: folio,
      message: 'Registro guardado',
      data: { fechaRegistro },
    });
  } catch (error) {
    console.error('Error al guardar en Neon:', error);
    return res.status(500).json({ status: 'error', message: 'No se pudo guardar el registro en la base de datos.' });
  }
}
