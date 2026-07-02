/**
 * @fileoverview Rutas del módulo de Productos
 * @module server/routes/productosRoutes
 */
import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import {
  getTipos, getProductos, getProductoById,
  createProducto, updateProducto, deleteProducto,
  getSiguienteCodigo,
} from '../controllers/productosController.js';
import { uploadProducto } from '../middleware/uploadProducto.js';

const router = Router();

// Todos los endpoints requieren autenticación
router.use(verifyToken);

// Tipos de producto
router.get('/tipos',               getTipos);

// Productos
router.get('/siguiente-codigo',    getSiguienteCodigo);
router.get('/',                    getProductos);
router.get('/:id',                 getProductoById);
router.delete('/:id', requireRole('admin'), deleteProducto);

router.post(
  '/',
  uploadProducto.single('imagen'),
  createProducto
);

router.put(
  '/:id',
  uploadProducto.single('imagen'),
  updateProducto
);

export default router;
