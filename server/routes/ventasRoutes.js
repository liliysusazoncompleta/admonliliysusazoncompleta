import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { createVenta } from '../controllers/ventasController.js';

const router = Router();
router.use(verifyToken);
router.post('/', createVenta);

export default router;
