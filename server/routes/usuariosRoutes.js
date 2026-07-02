/**
 * @fileoverview Rutas del módulo de Usuarios
 * @module server/routes/usuariosRoutes
 */
import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import { getUsuarios, createUsuario, updateUsuario, toggleUsuario, changePassword } from '../controllers/usuariosController.js';

const router = Router();
router.use(verifyToken);
router.get('/', getUsuarios);
router.post('/', requireRole('admin'), createUsuario);
router.put('/:id', requireRole('admin'), updateUsuario);
router.patch('/:id/toggle', requireRole('admin'), toggleUsuario);
router.post('/:id/change-password', requireRole('admin'), changePassword);

export default router;
