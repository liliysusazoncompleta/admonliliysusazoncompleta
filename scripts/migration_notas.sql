CREATE TABLE IF NOT EXISTS public.notas (
  id          SERIAL PRIMARY KEY,
  autor_id    INTEGER NOT NULL REFERENCES public.usuarios(id_usuario),
  contenido   TEXT NOT NULL CHECK (BTRIM(contenido) <> ''),
  color       VARCHAR(20) NOT NULL DEFAULT 'yellow',
  updated_by  INTEGER REFERENCES public.usuarios(id_usuario) ON DELETE SET NULL,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notas
  ADD COLUMN IF NOT EXISTS color VARCHAR(20) NOT NULL DEFAULT 'yellow';

ALTER TABLE public.notas
  ADD COLUMN IF NOT EXISTS updated_by INTEGER
  REFERENCES public.usuarios(id_usuario) ON DELETE SET NULL;

/*DO $$ -- este funciono en postgres local, pero no en producción por eso se crea el otro alter de la tabla de notas
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'notas_color_check'
      AND conrelid = 'public.notas'::regclass
  ) THEN
    ALTER TABLE public.notas
      ADD CONSTRAINT notas_color_check
      CHECK (color IN ('yellow', 'pink', 'green', 'blue', 'orange'));
  END IF;
END;
$$;*/

ALTER TABLE public.notas
  DROP CONSTRAINT IF EXISTS notas_color_check;

ALTER TABLE public.notas
  ADD CONSTRAINT notas_color_check
  CHECK (color IN ('yellow', 'pink', 'green', 'blue', 'orange'));


CREATE INDEX IF NOT EXISTS idx_notas_created_at
  ON public.notas (created_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS public.notificaciones_notas (
  id               SERIAL PRIMARY KEY,
  nota_id          INTEGER NOT NULL REFERENCES public.notas(id) ON DELETE CASCADE,
  destinatario_id  INTEGER NOT NULL REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE,
  actor_id         INTEGER REFERENCES public.usuarios(id_usuario) ON DELETE SET NULL,
  accion           VARCHAR(20) NOT NULL CHECK (accion IN ('creada', 'modificada')),
  created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  leida_en         TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_notificaciones_notas_destinatario
  ON public.notificaciones_notas (destinatario_id, leida_en, created_at DESC);
