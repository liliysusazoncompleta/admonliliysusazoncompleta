import bcrypt from 'bcrypt';
import { query } from '../config/db.js';

const normalizeRole = (r) => {
  if (!r) return r;
  const rr = String(r).toLowerCase();
  if (rr === 'ventas') return 'vendedor';
  if (rr === 'operador') return 'operario';
  if (rr === 'administrador' || rr === 'adm' || rr === 'admin' || rr === 'administrator') return 'admin';
  return rr;
};

/**
 * POST /api/admin/seed-users
 * Body: optional { users: [{correo, cedula, rol, password}] }
 * Header: x-seed-key must match process.env.SEED_KEY
 */
export const seedUsers = async (req, res) => {
  const seedKey = req.headers['x-seed-key'];
  if (!process.env.SEED_KEY) {
    return res.status(403).json({ success: false, message: 'SEED_KEY no configurada en el servidor. Activa process.env.SEED_KEY para usar este endpoint.' });
  }
  if (seedKey !== process.env.SEED_KEY) {
    return res.status(403).json({ success: false, message: 'Cabecera x-seed-key inválida.' });
  }

  const defaults = [
    { correo: 'liliysusazoncompleto@gmail.com', cedula: '44004348', rol: 'admin' },
    { correo: 'fliarangomosquera@gmail.com', cedula: '44004341', rol: 'vendedor' },
    { correo: 'Osirisv16@hotmail.com', cedula: '3013388006', rol: 'vendedor' },
    { correo: 'kamosva11@gmail.com', cedula: '3233969484', rol: 'operario' },
  ];

  const incoming = Array.isArray(req.body?.users) && req.body.users.length ? req.body.users : defaults;

  const results = [];
  for (const u of incoming) {
    const correo = (u.correo || '').toLowerCase().trim();
    const cedula = String(u.cedula || '').trim();
    const rol    = normalizeRole(u.rol || 'operario');
    const password = u.password || null;

    try {
      const { rows: found } = await query('SELECT id_usuario FROM public.usuarios WHERE lower(correo) = $1', [correo]);
      if (found.length) {
        await query('UPDATE public.usuarios SET rol = $1, activo = true WHERE lower(correo) = $2', [rol, correo]);
        results.push({ correo, action: 'updated', rol });
        continue;
      }

      // crear nuevo usuario
      const pwd = password || Math.random().toString(36).slice(2, 10) + 'A1!';
      const hash = await bcrypt.hash(pwd, 12);
      const ced = cedula || `seed-${Date.now()}`;
      const { rows } = await query(
        `INSERT INTO public.usuarios (cedula, correo, password_hash, rol, activo)
         VALUES ($1, $2, $3, $4, true)
         RETURNING id_usuario, correo, rol`,
        [ced, correo, hash, rol]
      );
      results.push({ correo, action: 'created', rol, password: pwd, id_usuario: rows[0].id_usuario });
    } catch (err) {
      console.error('[seedUsers]', err.message);
      results.push({ correo, action: 'error', error: err.message });
    }
  }

  return res.json({ success: true, results });
};
