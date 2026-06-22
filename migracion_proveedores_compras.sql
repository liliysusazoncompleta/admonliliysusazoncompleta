-- ============================================================
--  MIGRACIÓN: TblProveedores + TblCompras
--  Compatible con desarrollo y producción (PostgreSQL)
--  Ejecutar en orden. Idempotente: usa IF NOT EXISTS.
-- ============================================================

-- ------------------------------------------------------------
-- 1. TblProveedores
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "TblProveedores" (
    id          SERIAL          PRIMARY KEY,
    nit         VARCHAR(20)     NOT NULL UNIQUE,
    nombre      VARCHAR(150)    NOT NULL,
    direccion   VARCHAR(250),
    telefono    VARCHAR(20),
    estado      VARCHAR(10)     NOT NULL DEFAULT 'Activo'
                                CHECK (estado IN ('Activo', 'Inactivo')),

    -- Auditoría
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    created_by  VARCHAR(100)    NOT NULL DEFAULT current_user,
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_by  VARCHAR(100)    NOT NULL DEFAULT current_user
);

COMMENT ON TABLE  "TblProveedores"            IS 'Catálogo de proveedores';
COMMENT ON COLUMN "TblProveedores".nit        IS 'NIT único del proveedor';
COMMENT ON COLUMN "TblProveedores".estado     IS 'Activo | Inactivo';
COMMENT ON COLUMN "TblProveedores".created_at IS 'Fecha de creación del registro';
COMMENT ON COLUMN "TblProveedores".created_by IS 'Usuario que creó el registro';
COMMENT ON COLUMN "TblProveedores".updated_at IS 'Fecha de última modificación';
COMMENT ON COLUMN "TblProveedores".updated_by IS 'Usuario que modificó el registro';

-- Índices de búsqueda frecuente
CREATE INDEX IF NOT EXISTS idx_proveedores_nit    ON "TblProveedores" (nit);
CREATE INDEX IF NOT EXISTS idx_proveedores_estado ON "TblProveedores" (estado);

-- ------------------------------------------------------------
-- 2. TblCompras
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "TblCompras" (
    id             SERIAL          PRIMARY KEY,
    num_factura    VARCHAR(50)     NOT NULL UNIQUE,
    fecha_compra   DATE            NOT NULL DEFAULT CURRENT_DATE,
    proveedor_nit  VARCHAR(20)     NOT NULL
                                   REFERENCES "TblProveedores"(nit)
                                   ON UPDATE CASCADE
                                   ON DELETE RESTRICT,
    producto       VARCHAR(200)    NOT NULL,
    valor          NUMERIC(14, 2)  NOT NULL CHECK (valor > 0),

    -- Auditoría
    created_at     TIMESTAMP       NOT NULL DEFAULT NOW(),
    created_by     VARCHAR(100)    NOT NULL DEFAULT current_user,
    updated_at     TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_by     VARCHAR(100)    NOT NULL DEFAULT current_user
);

COMMENT ON TABLE  "TblCompras"                IS 'Registro de compras a proveedores';
COMMENT ON COLUMN "TblCompras".num_factura    IS 'Número de factura único';
COMMENT ON COLUMN "TblCompras".proveedor_nit  IS 'FK → TblProveedores.nit';
COMMENT ON COLUMN "TblCompras".producto       IS 'Nombre del producto ingresado manualmente';
COMMENT ON COLUMN "TblCompras".valor          IS 'Valor total de la compra';
COMMENT ON COLUMN "TblCompras".created_at     IS 'Fecha de creación del registro';
COMMENT ON COLUMN "TblCompras".created_by     IS 'Usuario que creó el registro';
COMMENT ON COLUMN "TblCompras".updated_at     IS 'Fecha de última modificación';
COMMENT ON COLUMN "TblCompras".updated_by     IS 'Usuario que modificó el registro';

CREATE INDEX IF NOT EXISTS idx_compras_proveedor_nit ON "TblCompras" (proveedor_nit);
CREATE INDEX IF NOT EXISTS idx_compras_fecha         ON "TblCompras" (fecha_compra);

-- ------------------------------------------------------------
-- 3. Trigger para actualizar updated_at automáticamente
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at := NOW();
    -- updated_by se actualiza desde la app; si no viene, conserva el anterior
    RETURN NEW;
END;
$$;

-- Trigger en TblProveedores
DROP TRIGGER IF EXISTS trg_proveedores_updated_at ON "TblProveedores";
CREATE TRIGGER trg_proveedores_updated_at
    BEFORE UPDATE ON "TblProveedores"
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Trigger en TblCompras
DROP TRIGGER IF EXISTS trg_compras_updated_at ON "TblCompras";
CREATE TRIGGER trg_compras_updated_at
    BEFORE UPDATE ON "TblCompras"
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ------------------------------------------------------------
-- 4. Datos de prueba (solo para desarrollo — borrar en prod)
-- ------------------------------------------------------------
-- INSERT INTO "TblProveedores" (nit, nombre, direccion, telefono, estado, created_by, updated_by)
-- VALUES
--   ('900123456-1', 'Distribuidora ABC',   'Calle 10 # 5-20, Bogotá',    '3001234567', 'Activo',   'admin', 'admin'),
--   ('800987654-2', 'Importaciones XYZ',   'Carrera 7 # 12-34, Medellín','3109876543', 'Activo',   'admin', 'admin'),
--   ('700456789-3', 'Suministros 123',     'Av. El Dorado, Cali',        '3207654321', 'Inactivo', 'admin', 'admin');

-- INSERT INTO "TblCompras" (num_factura, fecha_compra, proveedor_nit, producto, valor, created_by, updated_by)
-- VALUES
--   ('FAC-2025-001', '2025-06-01', '900123456-1', 'Resma papel carta',    1500000.00, 'admin', 'admin'),
--   ('FAC-2025-002', '2025-06-10', '800987654-2', 'Tóner impresora HP',    890000.50, 'admin', 'admin');
