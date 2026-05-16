-- ═══════════════════════════════════════════════════════════════════
-- MIGRACIÓN: Módulo de Productos
-- Ejecutar: psql -U postgres -d LiliysuSazonCompleta_DB -f scripts/schema_productos.sql
-- ═══════════════════════════════════════════════════════════════════

BEGIN;

-- ── TABLA: tipo_producto ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tipo_producto (
  id_tipo_producto  SERIAL        PRIMARY KEY,
  nombre            VARCHAR(100)  NOT NULL UNIQUE,
  descripcion       TEXT,
  created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  created_by        INT,
  updated_at        TIMESTAMP,
  updated_by        INT,
  activo            BOOLEAN       DEFAULT TRUE
);

-- ── TABLA: productos ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.productos (
  id_producto       SERIAL          PRIMARY KEY,
  codigo            VARCHAR(30)     NOT NULL UNIQUE,
  nombre            VARCHAR(150)    NOT NULL,
  id_tipo_producto  INT             NOT NULL,
  presentacion      VARCHAR(100)    NOT NULL,
  valor             NUMERIC(14,2)   NOT NULL CHECK (valor >= 0),
  descripcion       TEXT,
  imagen_url        VARCHAR(500),
  created_at        TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  created_by        INT,
  updated_at        TIMESTAMP,
  updated_by        INT,
  activo            BOOLEAN         DEFAULT TRUE,
  CONSTRAINT fk_producto_tipo
    FOREIGN KEY (id_tipo_producto)
    REFERENCES public.tipo_producto(id_tipo_producto)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_productos_tipo      ON public.productos(id_tipo_producto);
CREATE INDEX IF NOT EXISTS idx_productos_activo    ON public.productos(activo);
CREATE INDEX IF NOT EXISTS idx_productos_codigo    ON public.productos(codigo);

-- ── Datos iniciales: Tipos de producto ───────────────────────────
INSERT INTO public.tipo_producto (nombre, descripcion, activo) VALUES
  ('Arroz',       'Platos a base de arroz',                 true),
  ('Carne',       'Platos de res, cerdo y pollo',           true),
  ('Entradas',    'Aperitivos y entradas',                  true),
  ('Refrigerios', 'Opciones para refrigerio y merienda',    true),
  ('Sopas',       'Sopas y caldos artesanales',             true),
  ('Postres',     'Postres y dulces tradicionales',         true)
ON CONFLICT (nombre) DO NOTHING;

-- ── Datos iniciales: Productos ───────────────────────────────────
INSERT INTO public.productos (codigo, nombre, id_tipo_producto, presentacion, valor, descripcion, activo)
SELECT 'PRD-001','Arroz con Pollo Tradicional',
  (SELECT id_tipo_producto FROM public.tipo_producto WHERE nombre='Arroz'),
  'Bandeja 10 pax', 120000,
  'Clásica receta familiar, abundante en pollo desmechado, arroz amarillo con verduras frescas y condimentos artesanales.',
  true
WHERE NOT EXISTS (SELECT 1 FROM public.productos WHERE codigo='PRD-001');

INSERT INTO public.productos (codigo, nombre, id_tipo_producto, presentacion, valor, descripcion, activo)
SELECT 'PRD-002','Lomo de Cerdo en Salsa de Ciruela',
  (SELECT id_tipo_producto FROM public.tipo_producto WHERE nombre='Carne'),
  'Porción Ind.', 35000,
  'Jugoso lomo de cerdo horneado a baja temperatura, bañado en salsa dulce de ciruela con hierbas finas.',
  true
WHERE NOT EXISTS (SELECT 1 FROM public.productos WHERE codigo='PRD-002');

INSERT INTO public.productos (codigo, nombre, id_tipo_producto, presentacion, valor, descripcion, activo)
SELECT 'PRD-003','Empanaditas de Pipián (x50)',
  (SELECT id_tipo_producto FROM public.tipo_producto WHERE nombre='Entradas'),
  'Bandeja 50 und', 65000,
  'Mini empanadas crujientes rellenas de guiso de pipián con maíz tierno, perfectas para eventos.',
  true
WHERE NOT EXISTS (SELECT 1 FROM public.productos WHERE codigo='PRD-003');

COMMIT;

-- Verificar
SELECT p.codigo, p.nombre, t.nombre AS tipo, p.presentacion, p.valor
FROM public.productos p
JOIN public.tipo_producto t ON p.id_tipo_producto = t.id_tipo_producto
WHERE p.activo = true
ORDER BY p.codigo;
