/**
 * @fileoverview Controlador de Recuperación de Contraseña
 * @module server/controllers/passwordResetController
 */

import crypto  from 'crypto';
import bcrypt  from 'bcrypt';
import { query } from '../config/db.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

const BCRYPT_ROUNDS   = 12;
const TOKEN_BYTES     = 64;
const EXPIRES_MINUTES = parseInt(process.env.RESET_TOKEN_EXPIRES_MINUTES || '30');
const FRONTEND_URL    = process.env.FRONTEND_URL || 'http://localhost:5173';

const isPasswordStrong = (p) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#])[A-Za-z\d@$!%*?&_\-#]{8,}$/.test(p);

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// ── Verificar si las columnas de reset existen en la tabla ────────────────────
const checkResetColumnsExist = async () => {
  const { rows } = await query(
    `SELECT COUNT(*) AS total
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name   = 'usuarios'
       AND column_name  IN ('reset_token', 'reset_token_expires')`,
    [],
  );
  return parseInt(rows[0].total) === 2;
};

// ── POST /api/auth/forgot-password ────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  const GENERIC_OK = {
    success: true,
    message: 'Si ese correo está registrado, recibirás las instrucciones en breve.',
  };

  try {
    const { correo } = req.body;

    if (!correo || !isValidEmail(correo)) {
      return res.status(400).json({ success: false, message: 'Ingresa un correo electrónico válido.' });
    }

    // ── Verificar migración antes de continuar ────────────────────────────
    const columnsExist = await checkResetColumnsExist();
    if (!columnsExist) {
      console.error('[forgotPassword] ❌ Faltan columnas reset_token / reset_token_expires en la tabla usuarios.');
      console.error('   Ejecuta: psql -U postgres -d LiliysuSazonCompleta_DB -f scripts/migration_reset_password.sql');
      return res.status(500).json({
        success: false,
        message: 'El módulo de recuperación no está configurado en la base de datos. Contacta al administrador.',
      });
    }

    const correoNorm = correo.toLowerCase().trim();

    // ── Buscar usuario ────────────────────────────────────────────────────
    const { rows } = await query(
      `SELECT id_usuario, correo, activo FROM public.usuarios WHERE correo = $1 LIMIT 1`,
      [correoNorm],
    );

    const usuario = rows[0];

    // Respuesta genérica si no existe o inactivo (no revelar)
    if (!usuario || !usuario.activo) {
      console.log(`[forgotPassword] Correo no encontrado o inactivo: ${correoNorm}`);
      return res.json(GENERIC_OK);
    }

    // ── Generar token seguro ──────────────────────────────────────────────
    const resetToken   = crypto.randomBytes(TOKEN_BYTES).toString('hex');
    const tokenExpires = new Date(Date.now() + EXPIRES_MINUTES * 60 * 1000);

    // ── Guardar en BD ─────────────────────────────────────────────────────
    await query(
      `UPDATE public.usuarios
       SET reset_token = $1, reset_token_expires = $2, updated_at = NOW()
       WHERE id_usuario = $3`,
      [resetToken, tokenExpires, usuario.id_usuario],
    );

    // ── Construir enlace y enviar email ───────────────────────────────────
   const base = (FRONTEND_URL || 'http://localhost:5173')
  .replace(/\/+$/, '')   // elimina barras finales
  .replace(/#.*$/, '');  // elimina cualquier # existente
const resetUrl = `${base}/#/change-password?token=${resetToken}`;
console.log('[DEBUG] resetUrl:', resetUrl);
    const emailResult = await sendPasswordResetEmail(usuario.correo, resetUrl);

    if (!emailResult.success) {
      // Limpiar token si el email falló
      await query(
        `UPDATE public.usuarios SET reset_token = NULL, reset_token_expires = NULL WHERE id_usuario = $1`,
        [usuario.id_usuario],
      );
      return res.status(500).json({
        success: false,
        message: `No se pudo enviar el correo: ${emailResult.error}. Verifica la configuración SMTP en server/.env`,
      });
    }

    console.log(`[forgotPassword] ✅ Token enviado → id_usuario=${usuario.id_usuario}`);
    return res.json(GENERIC_OK);

  } catch (err) {
    console.error('[forgotPassword] Error:', err.message);
    return res.status(500).json({ success: false, message: `Error interno: ${err.message}` });
  }
};

// ── POST /api/auth/change-password ────────────────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Token, nueva contraseña y confirmación son requeridos.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Las contraseñas no coinciden.' });
    }
    if (!isPasswordStrong(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&_-#).',
      });
    }

    // Buscar usuario por token válido y no expirado
    const { rows } = await query(
      `SELECT id_usuario, correo FROM public.usuarios
       WHERE reset_token = $1 AND reset_token_expires > NOW() AND activo = true LIMIT 1`,
      [token],
    );

    if (!rows[0]) {
      return res.status(400).json({ success: false, message: 'El enlace de recuperación no es válido o ha expirado. Solicita uno nuevo.' });
    }

    const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await query(
      `UPDATE public.usuarios
       SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL,
           updated_at = NOW(), updated_by = $2
       WHERE id_usuario = $3`,
      [newHash, rows[0].id_usuario, rows[0].id_usuario],
    );

    console.log(`[changePassword] ✅ Contraseña actualizada → id_usuario=${rows[0].id_usuario}`);
    return res.json({ success: true, message: '¡Contraseña actualizada correctamente! Ya puedes iniciar sesión.' });

  } catch (err) {
    console.error('[changePassword] Error:', err.message);
    return res.status(500).json({ success: false, message: `Error interno: ${err.message}` });
  }
};

// ── GET /api/auth/validate-token/:token ───────────────────────────────────────
export const validateResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) return res.json({ success: true, valid: false });

    const { rows } = await query(
      `SELECT id_usuario FROM public.usuarios
       WHERE reset_token = $1 AND reset_token_expires > NOW() AND activo = true LIMIT 1`,
      [token],
    );
    return res.json({ success: true, valid: rows.length > 0 });
  } catch (err) {
    return res.status(500).json({ success: false, valid: false, message: err.message });
  }
};
