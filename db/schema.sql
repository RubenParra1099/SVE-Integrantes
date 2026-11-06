-- Ejecuta este script en Neon Console > SQL Editor
CREATE TABLE IF NOT EXISTS integrantes (
  id              SERIAL PRIMARY KEY,
  folio           TEXT GENERATED ALWAYS AS ('INT-' || LPAD(id::text, 4, '0')) STORED UNIQUE,
  nombre_completo TEXT        NOT NULL CHECK (char_length(nombre_completo) >= 3),
  edad            SMALLINT    NOT NULL CHECK (edad BETWEEN 10 AND 99),
  sexo            TEXT        NOT NULL CHECK (sexo IN ('Masculino', 'Femenino')),
  telefono        TEXT        NOT NULL,
  comunidad       TEXT,
  registrado_en   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS integrantes_registrado_en_idx ON integrantes (registrado_en DESC);

-- Vista con la fecha en hora CDMX para consultar cómodamente desde Neon Console
CREATE OR REPLACE VIEW integrantes_cdmx AS
SELECT folio, nombre_completo, edad, sexo, telefono, comunidad,
       registrado_en AT TIME ZONE 'America/Mexico_City' AS registrado_cdmx
FROM integrantes
ORDER BY registrado_en DESC;

-- Lista de comunidades que aparece en el formulario (se edita desde /admin).
-- Si no la creas aquí, /api/communities la crea y la llena sola la primera vez.
CREATE TABLE IF NOT EXISTS comunidades (
  id     SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE CHECK (char_length(nombre) BETWEEN 3 AND 100)
);
