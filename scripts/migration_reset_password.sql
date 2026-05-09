-- ─────────────────────────────────────────────────────────────────────────────
-- MIGRACIÓN: Agregar columnas de recuperación de contraseña
-- Tabla: public.usuarios
-- Ejecutar: psql -U postgres -d LiliysuSazonCompleta_DB -f scripts/migration_reset_password.sql
-- ─────────────────────────────────────────────────────────────────────────────

BEGIN;

-- Columna: token seguro de recuperación (hex de 64 bytes = 128 chars)
ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS reset_token        VARCHAR(128),
  ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;

-- Índice para búsqueda rápida por token (solo filas con token activo)
CREATE INDEX IF NOT EXISTS idx_usuarios_reset_token
  ON public.usuarios(reset_token)
  WHERE reset_token IS NOT NULL;

-- Comentarios de documentación
COMMENT ON COLUMN public.usuarios.reset_token
  IS 'Token hex seguro (crypto.randomBytes) para recuperación de contraseña. NULL cuando no hay solicitud activa.';

COMMENT ON COLUMN public.usuarios.reset_token_expires
  IS 'Timestamp de expiración del token (30 min desde generación). NULL cuando no hay solicitud activa.';

COMMIT;

-- Verificar resultado
SELECT
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'usuarios'
  AND column_name IN ('reset_token', 'reset_token_expires')
ORDER BY column_name;
