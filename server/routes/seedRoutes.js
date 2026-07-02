import { Router } from 'express';
import { seedUsers } from '../controllers/seedController.js';

const router = Router();

// POST /api/admin/seed-users
router.post('/seed-users', seedUsers);

export default router;
