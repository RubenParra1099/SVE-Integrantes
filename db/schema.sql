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
