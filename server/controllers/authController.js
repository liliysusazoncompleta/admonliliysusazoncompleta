/**
 * @fileoverview Controlador de Autenticación
 * @module server/controllers/authController
 *
 * Gestiona el inicio de sesión de usuarios contra la tabla public.usuarios.
 * Flujo:
 *   1. Busca el usuario por correo electrónico.
 *   2. Verifica que la cuenta esté activa (activo = true).
 *   3. Compara la contraseña en texto plano con el hash almacenado (bcrypt).
 *   4. Actualiza el campo ultimo_login con la fecha/hora actual.
 *   5. Emite un JWT firmado con los datos del usuario.
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

// ── Constantes ────────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'lili_sazon_dev_secret_changeme_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

/**
 * Genera un payload limpio y seguro para el JWT (sin datos sensibles).
 *
 * @param {Object} usuario - Fila de la tabla public.usuarios
 * @returns {Object} Payload para firmar en el token
 */
const buildTokenPayload = (usuario) => ({
  id_usuario:  usuario.id_usuario,
  cedula: usuario.cedula,
  correo:      usuario.correo,
  rol:         usuario.rol,
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
/**
 * Autentica a un usuario mediante correo y contraseña.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
export const login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    // ── 1. Validación de campos requeridos ─────────────────────────────────
    if (!correo || !password) {
      return res.status(400).json({
        success: false,
        message: 'El correo y la contraseña son requeridos.',
      });
    }

    // ── 2. Buscar usuario por correo ───────────────────────────────────────
    const { rows } = await query(
      `SELECT id_usuario, cedula, correo, password_hash, rol,
              ultimo_login, created_at, activo
       FROM public.usuarios
       WHERE correo = $1
       LIMIT 1`,
      [correo.toLowerCase().trim()],
    );

    const usuario = rows[0];

    // ── 3. Usuario no encontrado (respuesta genérica por seguridad) ────────
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas. Verifica tu correo y contraseña.',
      });
    }

    // ── 4. Verificar cuenta activa ─────────────────────────────────────────
    if (!usuario.activo) {
      return res.status(403).json({
        success: false,
        message: 'Tu cuenta está inactiva. Contacta al administrador del sistema.',
      });
    }

    // ── 5. Comparar contraseña con hash almacenado ─────────────────────────
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas. Verifica tu correo y contraseña.',
      });
    }

    // ── 6. Actualizar ultimo_login ─────────────────────────────────────────
    await query(
      `UPDATE public.usuarios
       SET ultimo_login = NOW(),
           updated_at   = NOW()
       WHERE id_usuario = $1`,
      [usuario.id_usuario],
    );

    // ── 7. Generar JWT ─────────────────────────────────────────────────────
    const token = jwt.sign(
      buildTokenPayload(usuario),
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    // ── 8. Respuesta exitosa ───────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: '¡Bienvenido/a de vuelta!',
      token,
      usuario: {
        id_usuario:  usuario.id_usuario,
        cedula:      usuario.cedula,
        correo:      usuario.correo,
        rol:         usuario.rol,
        ultimo_login: usuario.ultimo_login,
      },
    });

  } catch (error) {
    console.error('[authController.login] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor. Intenta nuevamente.',
    });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
/**
 * Retorna el perfil del usuario autenticado (requiere JWT válido).
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
export const getMe = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT id_usuario, cedula, correo, rol, ultimo_login, created_at
       FROM public.usuarios
       WHERE id_usuario = $1 AND activo = true
       LIMIT 1`,
      [req.user.id_usuario],
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    return res.json({ success: true, usuario: rows[0] });
  } catch (error) {
    console.error('[authController.getMe] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
/**
 * Logout lógico (invalidación gestionada en el cliente).
 * En una implementación con token blacklist / refresh tokens,
 * aquí se agregaría la lógica de revocación.
 */
export const logout = (_req, res) => {
  return res.json({ success: true, message: 'Sesión cerrada correctamente.' });
};

// ── GET /api/auth/perfil ──────────────────────────────────────────
export const getPerfil = async (req, res) => {
  try {
    const { rows } = await query(
  `SELECT
     u.id_usuario,
     u.cedula,
     u.correo,
     u.rol,
     u.activo,
     u.ultimo_login,
     u.created_at        AS usuario_desde,
     e.id_empleado,
     e.nombre            AS nombre_empleado,
     e.telefono,
     e.direccion_principal,
     e.direccion_alterna,
     e.cargo,
     e.salario,
     e.activo            AS empleado_activo
   FROM public.usuarios u
   LEFT JOIN public.empleados e ON u.cedula::text = e.cedula::text
   WHERE u.id_usuario = $1`,
  [req.user.id_usuario],
);
    if (!rows[0])
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });

    // Eliminar campos sensibles antes de enviar
    const { password_hash, reset_token, reset_token_expires, ...perfil } = rows[0];

    res.json({ success: true, data: perfil });
  } catch (err) {
    console.error('[getPerfil]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
