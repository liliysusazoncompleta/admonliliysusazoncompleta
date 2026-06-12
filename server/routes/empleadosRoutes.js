/**
 * @fileoverview Rutas del módulo de Empleados
 * @module server/routes/empleadosRoutes
 */
import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getEmpleados, createEmpleado, updateEmpleado, toggleEmpleado } from '../controllers/empleadosController.js';

const router = Router();
router.use(verifyToken);
router.get('/', getEmpleados);
router.post('/', createEmpleado);
router.put('/:id', updateEmpleado);
router.patch('/:id/toggle', toggleEmpleado);

export default router;
