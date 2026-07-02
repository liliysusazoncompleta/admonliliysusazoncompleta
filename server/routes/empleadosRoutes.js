/**
 * @fileoverview Rutas del módulo de Empleados
 * @module server/routes/empleadosRoutes
 */
import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import { getEmpleados, createEmpleado, updateEmpleado, toggleEmpleado } from '../controllers/empleadosController.js';

const router = Router();
router.use(verifyToken);
router.get('/', getEmpleados);
router.post('/', requireRole('admin'), createEmpleado);
router.put('/:id', requireRole('admin'), updateEmpleado);
router.patch('/:id/toggle', requireRole('admin'), toggleEmpleado);

export default router;
