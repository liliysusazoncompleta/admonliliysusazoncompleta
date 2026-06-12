import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getVentas, createVenta, updateVentaEstado } from '../controllers/ventasController.js';

const router = Router();
router.use(verifyToken);
router.get('/', getVentas);
router.post('/', createVenta);
router.patch('/:id/estado', updateVentaEstado);

export default router;
