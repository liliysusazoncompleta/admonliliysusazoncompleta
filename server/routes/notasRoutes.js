import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  createNota,
  deleteNota,
  getNotas,
  getNotificacionesNotas,
  markNotificacionesNotasRead,
  updateNota,
} from '../controllers/notasController.js';

const router = Router();
router.use(verifyToken);
router.get('/notificaciones', getNotificacionesNotas);
router.patch('/notificaciones/leidas', markNotificacionesNotasRead);
router.get('/', getNotas);
router.post('/', createNota);
router.put('/:id', updateNota);
router.delete('/:id', deleteNota);

export default router;
