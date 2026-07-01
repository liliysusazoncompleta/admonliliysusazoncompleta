/**
 * @fileoverview Controlador de Autenticación
 * @module server/controllers/authController
 *
 * Ruta: server/controllers/authController.js
 *
 * Exports requeridos por authRoutes.js:
 *   login, getMe, logout, getPerfil
 *
 * Recuperación de contraseña está en passwordResetController.js
 */

import bcrypt    from 'bcryptjs';
import jwt       from 'jsonwebtoken';
import { query } from '../config/db.js';

const JWT_SECRET  = process.env.JWT_SECRET  || 'lili_sazon_dev_secret_changeme_in_production';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '8h';

// ── POST /api/auth/login ──────────────────────────────────────────────────────
export const login = async (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({
      success: false,
      message: 'Correo y contraseña son requeridos.',
    });
  }

  try {
    // JOIN con empleados para incluir empleado_nombre en la sesión
    const { rows } = await query(
      `SELECT
         u.id_usuario,
         u.cedula,
         u.correo,
         u.password_hash,
         u.rol,
         u.activo,
         u.ultimo_login,
         e.nombre AS empleado_nombre
       FROM usuarios u
       LEFT JOIN empleados e ON e.cedula = u.cedula
       WHERE u.correo = $1
         AND u.activo = true`,
      [correo.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
    }

    const user = rows[0];

    const passwordOk = await bcrypt.compare(password, user.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
    }

    // Actualizar último login
    await query(
      'UPDATE usuarios SET ultimo_login = NOW() WHERE id_usuario = $1',
      [user.id_usuario]
    );

    const token = jwt.sign(
      {
        id_usuario:      user.id_usuario,
        correo:          user.correo,
        rol:             user.rol,
        empleado_nombre: user.empleado_nombre || null,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    // Objeto que useAuth guarda en localStorage como 'lili_usuario'
    const usuarioPublico = {
      id_usuario:      user.id_usuario,
      cedula:          user.cedula,
      correo:          user.correo,
      rol:             user.rol,
      empleado_nombre: user.empleado_nombre || null,
    };

    return res.json({ success: true, token, usuario: usuarioPublico });

  } catch (err) {
    console.error('[auth/login]', err.message);
    return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};

// ── GET /api/auth/me  &  GET /api/auth/perfil ────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT
         u.id_usuario,
         u.cedula,
         u.correo,
         u.rol,
         u.activo,
         u.ultimo_login,
         u.created_at          AS usuario_desde,
         e.id_empleado,
         e.nombre              AS nombre_empleado,
         e.telefono,
         e.cargo,
         e.salario,
         e.direccion_principal,
         e.direccion_alterna,
         e.activo              AS empleado_activo
       FROM usuarios u
       LEFT JOIN empleados e ON e.cedula = u.cedula
       WHERE u.id_usuario = $1`,
      [req.user.id_usuario]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    // MiCuentaPage espera data.data  (estructura: { success, data })
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[auth/getMe]', err.message);
    return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};

// ── GET /api/auth/perfil ──────────────────────────────────────────────────────
export const getPerfil = getMe;

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
export const logout = async (_req, res) => {
  return res.json({ success: true, message: 'Sesión cerrada.' });
};