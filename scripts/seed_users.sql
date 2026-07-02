-- Seed script: asigna roles a usuarios existentes.
-- Ejecuta en la base de datos (psql) para actualizar roles basados en correo.
-- Nota: para crear usuarios nuevos con contraseña bcrypt usa el endpoint /api/admin/seed-users

BEGIN;

-- Rol Admon
UPDATE public.usuarios
SET rol = 'admin', activo = true
WHERE lower(correo) = 'liliysusazoncompleto@gmail.com';

-- Rol Vendedor
UPDATE public.usuarios
SET rol = 'vendedor', activo = true
WHERE lower(correo) IN ('fliarangomosquera@gmail.com', 'osirisv16@hotmail.com');

-- Rol Operario
UPDATE public.usuarios
SET rol = 'operario', activo = true
WHERE lower(correo) = 'kamosva11@gmail.com';

COMMIT;

-- Si necesitas crear usuarios nuevos desde SQL, debes insertar un hash bcrypt válido
-- Ejemplo (no recomendado desde SQL):
-- INSERT INTO public.usuarios (cedula, correo, password_hash, rol, activo)
-- VALUES ('44004348','liliysusazoncompleto@gmail.com','$2b$12$...bcrypt-hash...', 'admin', true);
