/**
 * @fileoverview Rutas del módulo de Empleados
 * @module server/routes/empleadosRoutes
 */
import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getEmpleados } from '../controllers/empleadosController.js';

const router = Router();
router.use(verifyToken);
router.get('/', getEmpleados);

export default router;
