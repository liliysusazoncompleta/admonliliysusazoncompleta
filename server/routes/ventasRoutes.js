import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import {
  getVentas,
  createVenta,
  updateVentaEstado,
  updateVenta,
  deleteVenta,
} from '../controllers/ventasController.js';

const router = Router();
router.use(verifyToken);
router.get('/', requireRole('admin'), getVentas);
router.post('/', requireRole('admin'), createVenta);
router.put('/:id', requireRole('admin'), updateVenta);
router.patch('/:id/estado', requireRole('admin'), updateVentaEstado);
router.delete('/:id', requireRole('admin'), deleteVenta);

export default router;
