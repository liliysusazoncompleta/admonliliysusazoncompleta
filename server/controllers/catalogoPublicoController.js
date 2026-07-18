/**
 * @fileoverview Controlador publico de catalogo (categorias y productos)
 * consumido por la tienda web (liliysusazoncompleta storefront, GitHub Pages).
 * Solo lectura, sin autenticacion: es la misma informacion que ya se muestra
 * publicamente en la tienda, no requiere login como el resto del panel.
 * @module server/controllers/catalogoPublicoController
 */
import { query } from '../config/db.js';

// Categorias administrativas/internas que no deben verse en la tienda
// publica (si llegan a existir). Comparacion insensible a mayusculas.
const HIDDEN_CATEGORIES = ['negocio', 'domicilio', 'combos', 'otros'];

export async function getCategoriasPublicas(_req, res) {
  try {
    const { rows } = await query(
      `SELECT id_tipo_producto, nombre, descripcion
       FROM tipo_producto
       WHERE activo = true
         AND lower(nombre) <> ALL($1::text[])
       ORDER BY nombre ASC`,
      [HIDDEN_CATEGORIES],
    );
    res.json({ categorias: rows });
  } catch (error) {
    console.error('[catalogoPublicoController] getCategoriasPublicas', error);
    res.status(500).json({ error: 'No se pudieron cargar las categorias.' });
  }
}

export async function getProductosPublicos(req, res) {
  try {
    const { categoriaId, search } = req.query;
    const values = [HIDDEN_CATEGORIES];
    const where = ['p.activo = true', 'tp.activo = true', 'lower(tp.nombre) <> ALL($1::text[])'];

    if (categoriaId) {
      values.push(Number(categoriaId));
      where.push(`p.id_tipo_producto = $${values.length}`);
    }
    if (search) {
      values.push(`%${search}%`);
      where.push(`p.nombre ILIKE $${values.length}`);
    }

    const { rows } = await query(
      `SELECT
         p.id_producto,
         p.codigo,
         p.nombre,
         p.id_tipo_producto,
         tp.nombre AS categoria,
         p.presentacion,
         p.valor,
         p.descripcion,
         p.imagen_url
       FROM productos p
       JOIN tipo_producto tp ON p.id_tipo_producto = tp.id_tipo_producto
       WHERE ${where.join(' AND ')}
       ORDER BY p.nombre ASC`,
      values,
    );

    const productos = rows.map((row) => ({ ...row, valor: Number(row.valor) }));
    res.json({ productos });
  } catch (error) {
    console.error('[catalogoPublicoController] getProductosPublicos', error);
    res.status(500).json({ error: 'No se pudo cargar el catalogo.' });
  }
}

export default { getCategoriasPublicas, getProductosPublicos };
