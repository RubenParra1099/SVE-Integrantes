import { neon } from '@neondatabase/serverless';
import { COMMUNITIES } from '../src/config/communities.js';

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
  const nombre = String(body.nombreCompleto ?? '').trim();
  const edad = parseInt(String(body.edad ?? ''), 10);
  const sexo = String(body.sexo ?? '');
  const telefono = String(body.telefono ?? '').trim();
  const digits = telefono.replace(/\D/g, '');
  const comunidad = String(body.comunidad ?? '').trim();

  if (
    !(COMMUNITIES as readonly string[]).includes(comunidad) ||
    nombre.length < 3 ||
    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(nombre) ||
    isNaN(edad) || edad < 10 || edad > 99 ||
    !['Masculino', 'Femenino'].includes(sexo) ||
    digits.length < 8 || digits.length > 15
  ) {
    return res.status(400).json({ status: 'error', message: 'Datos de registro inválidos.' });
  }

  try {
    const sql = neon(databaseUrl);
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
