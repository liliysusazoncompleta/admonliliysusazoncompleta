/**
 * @fileoverview Rutas de autenticación y recuperación de contraseña
 * @module server/routes/authRoutes
 */

import { Router } from 'express';
import { login, getMe, logout }                                       from '../controllers/authController.js';
import { forgotPassword, changePassword, validateResetToken }         from '../controllers/passwordResetController.js';
import { verifyToken }                                                from '../middleware/authMiddleware.js';

const router = Router();

// ── Autenticación ─────────────────────────────────────────────────────────────
router.post('/login',  login);
router.get ('/me',     verifyToken, getMe);
router.post('/logout', verifyToken, logout);

// ── Recuperación de contraseña ────────────────────────────────────────────────
// POST /api/auth/forgot-password      → solicitar reset (envía email)
// GET  /api/auth/validate-token/:token → verificar si el token es válido
// POST /api/auth/change-password      → establecer nueva contraseña
router.post('/forgot-password',          forgotPassword);
router.get ('/validate-token/:token',    validateResetToken);
router.post('/change-password',          changePassword);

export default router;
