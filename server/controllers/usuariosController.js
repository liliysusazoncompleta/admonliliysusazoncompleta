/**
 * @fileoverview Controlador de Usuarios
 * @module server/controllers/usuariosController
 */
import { query } from '../config/db.js';
import bcrypt from 'bcrypt';

const fmtError = (res, err, ctx) => {
  console.error(`[${ctx}]`, err.message);
  return res.status(500).json({ success: false, message: `Error interno: ${err.message}` });
};

export const getUsuarios = async (req, res) => {
  try {
    const { q, activos } = req.query;
    const params = [];
    const conds = [];

    if (activos !== 'todos') {
      conds.push(`u.activo = true`);
    }

    if (q) {
      params.push(`%${q}%`);
      conds.push(`(u.correo ILIKE $${params.length} OR e.nombre ILIKE $${params.length})`);
    }

    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

    const { rows } = await query(
      `SELECT u.id_usuario, u.cedula, u.correo, u.rol, u.ultimo_login,
              u.activo, u.created_at, e.nombre AS empleado_nombre
       FROM public.usuarios u
       LEFT JOIN public.empleados e ON u.cedula = e.cedula
       ${where}
       ORDER BY u.correo`,
      params
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    fmtError(res, e, 'getUsuarios');
  }
};

export const createUsuario = async (req, res) => {
  try {
    const { cedula, correo, password, rol = 'operador' } = req.body;

    if (!cedula || !correo || !password) {
      return res.status(400).json({
        success: false,
        message: 'cedula, correo y password son requeridos.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const { rows } = await query(
      `INSERT INTO public.usuarios
        (cedula, correo, password_hash, rol, activo)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id_usuario, cedula, correo, rol, activo, created_at`,
      [cedula, correo, passwordHash, rol]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (e) {
    if (e.code === '23505') {
      return res.status(409).json({ success: false, message: 'Ya existe un usuario con ese correo.' });
    }
    fmtError(res, e, 'createUsuario');
  }
};

export const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { correo, rol } = req.body;

    if (!correo || !rol) {
      return res.status(400).json({
        success: false,
        message: 'correo y rol son requeridos.'
      });
    }

    const { rows } = await query(
      `UPDATE public.usuarios
       SET correo = $1, rol = $2
       WHERE id_usuario = $3
       RETURNING id_usuario, cedula, correo, rol, activo`,
      [correo, rol, id]
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (e) {
    if (e.code === '23505') {
      return res.status(409).json({ success: false, message: 'Ya existe un usuario con ese correo.' });
    }
    fmtError(res, e, 'updateUsuario');
  }
};

export const toggleUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    const { rows } = await query(
      `UPDATE public.usuarios
       SET activo = $1
       WHERE id_usuario = $2
       RETURNING id_usuario, correo, activo`,
      [activo, id]
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (e) {
    fmtError(res, e, 'toggleUsuario');
  }
};

export const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'password es requerido.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const { rows } = await query(
      `UPDATE public.usuarios
       SET password_hash = $1
       WHERE id_usuario = $2
       RETURNING id_usuario, correo`,
      [passwordHash, id]
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    res.json({ success: true, message: 'Contraseña actualizada correctamente.' });
  } catch (e) {
    fmtError(res, e, 'changePassword');
  }
};
