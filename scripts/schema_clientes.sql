-- ════════════════════════════════════════════════════════════════════════════
-- Lili y su Sazón Completa — Esquema de Clientes
-- ════════════════════════════════════════════════════════════════════════════
-- Reglas de negocio:
--   • Teléfono obligatorio y único
--   • Teléfono alterno opcional
--   • NIT/CC opcional pero único cuando se provee
--   • Máximo 2 direcciones (principal obligatoria, alterna opcional)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.clientes (
    id_cliente          SERIAL PRIMARY KEY,

    nombre              VARCHAR(200) NOT NULL,

    nit_cc              VARCHAR(30) UNIQUE,

    telefono            VARCHAR(20) NOT NULL UNIQUE,
    telefono_alt        VARCHAR(20),

    direccion_principal TEXT NOT NULL,
    direccion_alterna   TEXT,

    observaciones       TEXT,

    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by          INT,
    updated_at          TIMESTAMP,
    updated_by          INT,
    activo              BOOLEAN DEFAULT TRUE
);

-- ── Índices ─────────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_telefono ON public.clientes(telefono);
CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_nit      ON public.clientes(nit_cc);
CREATE INDEX        IF NOT EXISTS idx_clientes_nombre   ON public.clientes(nombre);
