/**
 * @fileoverview Rutas del módulo de Usuarios
 * @module server/routes/usuariosRoutes
 */
import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getUsuarios, createUsuario, updateUsuario, toggleUsuario, changePassword } from '../controllers/usuariosController.js';

const router = Router();
router.use(verifyToken);
router.get('/', getUsuarios);
router.post('/', createUsuario);
router.put('/:id', updateUsuario);
router.patch('/:id/toggle', toggleUsuario);
router.post('/:id/change-password', changePassword);

export default router;
