import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getCompras, createCompra, updateCompra, deleteCompra } from '../controllers/comprasController.js';

const router = Router();
router.use(verifyToken);
router.get('/',    getCompras);
router.post('/',   createCompra);
router.put('/:id', updateCompra);
router.delete('/:id', deleteCompra);
export default router;
