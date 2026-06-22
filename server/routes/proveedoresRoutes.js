import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  getProveedores, getProveedorById,
  createProveedor, updateProveedor,
  toggleEstado, deleteProveedor,
} from '../controllers/proveedoresController.js';

const router = Router();
router.use(verifyToken);

router.get('/',           getProveedores);
router.get('/:id',        getProveedorById);
router.post('/',          createProveedor);
router.put('/:id',        updateProveedor);
router.patch('/:id/estado', toggleEstado);
router.delete('/:id',     deleteProveedor);

export default router;
