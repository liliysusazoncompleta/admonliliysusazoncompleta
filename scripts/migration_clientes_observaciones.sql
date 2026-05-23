-- ════════════════════════════════════════════════════════════════════════════
-- Migración: agregar columna observaciones a public.clientes
-- Ejecutar si la tabla fue creada antes de incluir el campo observaciones.
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.clientes
    ADD COLUMN IF NOT EXISTS observaciones TEXT;
