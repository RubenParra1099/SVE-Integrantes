# Registro de Nuevos Integrantes

Formulario React + Vite. Los registros se guardan en Postgres (Neon) a través de la función serverless `api/register.ts` (Vercel).

```
Navegador ──POST /api/register──▶ Función Vercel ──SQL──▶ Neon Postgres ◀── Neon Console (ver datos)
```

## 1. Crear la base de datos en Neon
1. Entra a https://console.neon.tech y crea un proyecto (región: AWS US East 2 o la más cercana).
2. Abre **SQL Editor**, pega el contenido de `db/schema.sql` y ejecútalo.
3. En **Dashboard → Connect** copia la *connection string* (la versión **pooled**).

## 2. Correr en local
```bash
npm install
cp .env.example .env      # pega tu DATABASE_URL de Neon
npx vercel link           # solo la primera vez
npm run dev               # http://localhost:3000 (frontend + /api)
```

## 3. Desplegar en Vercel
1. Sube el repo a GitHub e impórtalo en Vercel (framework: Vite).
2. En **Settings → Environment Variables** agrega `DATABASE_URL`
   (o usa la integración oficial de Neon en Vercel Marketplace, que la crea sola).
3. Deploy.

## 4. Ver los registros en Neon Console
- **Tables** → `integrantes` para ver/editar filas.
- **SQL Editor**: `SELECT * FROM integrantes_cdmx;` (fecha en hora CDMX).
- Exportar: `SELECT * FROM integrantes_cdmx;` y descarga el resultado en CSV.
