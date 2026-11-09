import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import { getBalance } from '../controllers/dashboardController.js';

const router = Router();
router.use(verifyToken);
router.get('/balance', requireRole('admin'), getBalance);

export default router;
