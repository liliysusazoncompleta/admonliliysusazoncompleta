-- ─────────────────────────────────────────────────────────────────────────────
-- Schema: Lili y su Sazón Completa — Base de Datos
-- Base: LiliysuSazonCompleta_DB
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Tabla de Usuarios ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.usuarios (
  id_usuario    SERIAL                    PRIMARY KEY,
  id_empleado   INTEGER                   NOT NULL UNIQUE,
  correo        VARCHAR(255)              NOT NULL UNIQUE,
  password_hash VARCHAR(255)              NOT NULL,
  rol           VARCHAR(50)               NOT NULL DEFAULT 'operador'
                                          CHECK (rol IN ('admin', 'operador', 'cocinero', 'cliente')),
  ultimo_login  TIMESTAMP WITH TIME ZONE,
  created_at    TIMESTAMP WITH TIME ZONE  NOT NULL DEFAULT NOW(),
  created_by    INTEGER                   REFERENCES public.usuarios(id_usuario),
  updated_at    TIMESTAMP WITH TIME ZONE  NOT NULL DEFAULT NOW(),
  updated_by    INTEGER                   REFERENCES public.usuarios(id_usuario),
  activo        BOOLEAN                   NOT NULL DEFAULT TRUE
);

-- Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_correo     ON public.usuarios(correo);
CREATE INDEX IF NOT EXISTS idx_usuarios_id_empleado ON public.usuarios(id_empleado);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo      ON public.usuarios(activo);

-- Trigger: actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON public.usuarios;
CREATE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Usuario administrador inicial ─────────────────────────────────────────────
-- Contraseña: Admin@Lili2024
-- Hash generado con: bcrypt.hash('Admin@Lili2024', 12)
-- ⚠️  CAMBIAR en producción después del primer acceso
INSERT INTO public.usuarios (id_empleado, correo, password_hash, rol, activo)
VALUES (
  1,
  'admin@liliysazon.com',
  '$2b$12$placeholder_reemplazar_con_hash_real',
  'admin',
  true
)
ON CONFLICT (correo) DO NOTHING;

-- ── Comentarios de documentación ─────────────────────────────────────────────
COMMENT ON TABLE  public.usuarios              IS 'Tabla de usuarios del sistema ERP';
COMMENT ON COLUMN public.usuarios.id_usuario   IS 'Clave primaria autoincremental';
COMMENT ON COLUMN public.usuarios.id_empleado  IS 'Referencia al ID del empleado en RRHH';
COMMENT ON COLUMN public.usuarios.correo       IS 'Correo corporativo (usado para login)';
COMMENT ON COLUMN public.usuarios.password_hash IS 'Hash bcrypt de la contraseña (cost=12)';
COMMENT ON COLUMN public.usuarios.rol          IS 'Rol de acceso: admin | operador | cocinero | cliente';
COMMENT ON COLUMN public.usuarios.ultimo_login IS 'Timestamp del último inicio de sesión exitoso';
COMMENT ON COLUMN public.usuarios.activo       IS 'FALSE = cuenta deshabilitada (soft-delete)';
