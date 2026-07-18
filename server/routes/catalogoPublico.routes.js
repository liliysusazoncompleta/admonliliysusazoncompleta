/**
 * @fileoverview Rutas publicas de catalogo (categorias/productos) consumidas
 * por la tienda web (liliysusazoncompleta storefront). Solo lectura, sin
 * autenticacion, ya que es informacion publica del catalogo (equivalente a
 * /api/tipo-producto, que ya es publica).
 * @module server/routes/catalogoPublico.routes
 */
import { Router } from 'express';
import { getCategoriasPublicas, getProductosPublicos } from '../controllers/catalogoPublicoController.js';

const router = Router();

// GET /api/catalogo/categorias
router.get('/categorias', getCategoriasPublicas);

// GET /api/catalogo/productos?categoriaId=&search=
router.get('/productos', getProductosPublicos);

export default router;
