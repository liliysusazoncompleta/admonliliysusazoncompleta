import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import { getVentas, createVenta, updateVentaEstado } from '../controllers/ventasController.js';

const router = Router();
router.use(verifyToken);
router.get('/', requireRole('admin'), getVentas);
router.post('/', requireRole('admin'), createVenta);
router.patch('/:id/estado', requireRole('admin'), updateVentaEstado);

export default router;
