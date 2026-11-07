import { neon } from '@neondatabase/serverless';
import { COMMUNITIES } from '../../src/config/communities.js';

export type Sql = ReturnType<typeof neon>;

// Ejecuta fn; si la tabla comunidades todavía no existe, la crea con la lista inicial y reintenta.
export async function withTable<T>(sql: Sql, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (error?.code !== '42P01') throw error;
    await sql.transaction([
      sql`CREATE TABLE IF NOT EXISTS comunidades (
            id     SERIAL PRIMARY KEY,
            nombre TEXT NOT NULL UNIQUE CHECK (char_length(nombre) BETWEEN 3 AND 100)
          )`,
      sql`INSERT INTO comunidades (nombre)
          SELECT nombre FROM unnest(${[...COMMUNITIES]}::text[]) WITH ORDINALITY AS t(nombre, n)
          ORDER BY n
          ON CONFLICT (nombre) DO NOTHING`,
    ]);
    return fn();
  }
}
