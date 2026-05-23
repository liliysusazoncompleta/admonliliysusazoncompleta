/**
 * @fileoverview Rutas del módulo de Clientes
 * @module server/routes/clientesRoutes
 */
import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  getClientes, getClienteById,
  createCliente, updateCliente, deleteCliente,
} from '../controllers/clientesController.js';

const router = Router();

// Todos los endpoints requieren autenticación
router.use(verifyToken);

router.get('/',       getClientes);
router.get('/:id',    getClienteById);
router.post('/',      createCliente);
router.put('/:id',    updateCliente);
router.delete('/:id', deleteCliente);

export default router;
