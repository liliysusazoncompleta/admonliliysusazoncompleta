/**
 * @fileoverview Controlador de Productos — CRUD completo
 * @module server/controllers/productosController
 */
import { query } from '../config/db.js';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtError = (res, err, ctx) => {
  console.error(`[${ctx}]`, err.message);
  return res.status(500).json({ success: false, message: `Error interno: ${err.message}` });
};

// ── GET /api/tipo-producto ────────────────────────────────────────────────────
export const getTipos = async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT id_tipo_producto, nombre, descripcion
       FROM public.tipo_producto WHERE activo = true ORDER BY nombre`,
    );
    res.json({ success: true, data: rows });
  } catch (e) { fmtError(res, e, 'getTipos'); }
};

// ── GET /api/productos ────────────────────────────────────────────────────────
export const getProductos = async (req, res) => {
  try {
    const { tipo, q, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    const conds  = ['p.activo = true'];

    if (tipo) { params.push(tipo); conds.push(`t.nombre ILIKE $${params.length}`); }
    if (q)    { params.push(`%${q}%`); conds.push(`(p.nombre ILIKE $${params.length} OR p.codigo ILIKE $${params.length})`); }

    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    params.push(parseInt(limit), offset);

    const sql = `
      SELECT p.id_producto, p.codigo, p.nombre, p.presentacion,
             p.valor, p.descripcion, p.imagen_url, p.created_at, p.updated_at,
             t.id_tipo_producto, t.nombre AS tipo_nombre
      FROM public.productos p
      JOIN public.tipo_producto t ON p.id_tipo_producto = t.id_tipo_producto
      ${where}
      ORDER BY p.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const countSql = `
      SELECT COUNT(*) FROM public.productos p
      JOIN public.tipo_producto t ON p.id_tipo_producto = t.id_tipo_producto
      ${where.replace(`LIMIT $${params.length - 1} OFFSET $${params.length}`, '')}`;

    const [data, total] = await Promise.all([
      query(sql, params),
      query(countSql, params.slice(0, -2)),
    ]);

    res.json({
      success: true,
      data: data.rows,
      total: parseInt(total.rows[0].count),
      page: parseInt(page),
    });
  } catch (e) { fmtError(res, e, 'getProductos'); }
};

// ── GET /api/productos/:id ────────────────────────────────────────────────────
export const getProductoById = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT p.*, t.nombre AS tipo_nombre
       FROM public.productos p
       JOIN public.tipo_producto t ON p.id_tipo_producto = t.id_tipo_producto
       WHERE p.id_producto = $1 AND p.activo = true`,
      [req.params.id],
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
    res.json({ success: true, data: rows[0] });
  } catch (e) { fmtError(res, e, 'getProductoById'); }
};

// ── POST /api/productos ───────────────────────────────────────────────────────
export const createProducto = async (req, res) => {
  try {
    const {  codigo,
  nombre,
  id_tipo_producto,
  presentacion,
  valor,
  descripcion, } = req.body;
  const imagen_url = req.file
  ? `/uploads/productos/${req.file.filename}`
  : null;

    if (!codigo || !nombre || !id_tipo_producto || !presentacion || valor == null)
      return res.status(400).json({ success: false, message: 'Código, nombre, tipo, presentación y valor son requeridos.' });

    // Verificar código único
    const dup = await query('SELECT id_producto FROM public.productos WHERE codigo = $1', [codigo.trim().toUpperCase()]);
    if (dup.rows[0])
      return res.status(409).json({ success: false, message: `Ya existe un producto con el código ${codigo}.` });

    const { rows } = await query(
      `INSERT INTO public.productos
         (codigo, nombre, id_tipo_producto, presentacion, valor, descripcion, imagen_url, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [codigo.trim().toUpperCase(), nombre.trim(), id_tipo_producto, presentacion.trim(),
       parseFloat(valor), descripcion?.trim() || null, imagen_url || null,
       req.user?.id_usuario || null],
    );

    console.log(`[createProducto] ✅ ${rows[0].codigo} — ${rows[0].nombre}`);
    res.status(201).json({ success: true, message: 'Producto creado correctamente.', data: rows[0] });
  } catch (e) { fmtError(res, e, 'createProducto'); }
};

// ── PUT /api/productos/:id ────────────────────────────────────────────────────
export const updateProducto = async (req, res) => {
  try {
    const { nombre, id_tipo_producto, presentacion, valor, descripcion, } = req.body;
    const imagen_url = req.file
  ? `/uploads/productos/${req.file.filename}`
  : req.body.imagen_url || null;
  
    const { id } = req.params;

    if (!nombre || !id_tipo_producto || !presentacion || valor == null)
      return res.status(400).json({ success: false, message: 'Nombre, tipo, presentación y valor son requeridos.' });

    const { rows } = await query(
      `UPDATE public.productos
       SET nombre=$1, id_tipo_producto=$2, presentacion=$3, valor=$4,
           descripcion=$5, imagen_url=$6, updated_at=NOW(), updated_by=$7
       WHERE id_producto=$8 AND activo=true
       RETURNING *`,
      [nombre.trim(), id_tipo_producto, presentacion.trim(), parseFloat(valor),
       descripcion?.trim() || null, imagen_url || null,
       req.user?.id_usuario || null, id],
    );

    if (!rows[0]) return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
    console.log(`[updateProducto] ✅ ID ${id}`);
    res.json({ success: true, message: 'Producto actualizado correctamente.', data: rows[0] });
  } catch (e) { fmtError(res, e, 'updateProducto'); }
};

// ── DELETE /api/productos/:id  (soft delete) ──────────────────────────────────
export const deleteProducto = async (req, res) => {
  try {
    const { rows } = await query(
      `UPDATE public.productos
       SET activo=false, updated_at=NOW(), updated_by=$1
       WHERE id_producto=$2 AND activo=true RETURNING id_producto, nombre`,
      [req.user?.id_usuario || null, req.params.id],
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
    console.log(`[deleteProducto] ✅ ID ${req.params.id} — ${rows[0].nombre}`);
    res.json({ success: true, message: `Producto "${rows[0].nombre}" eliminado correctamente.` });
  } catch (e) { fmtError(res, e, 'deleteProducto'); }
};

// ── GET /api/productos/siguiente-codigo ───────────────────────────────────────
export const getSiguienteCodigo = async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT codigo FROM public.productos
       WHERE codigo ~ '^PRD-[0-9]+$'
       ORDER BY CAST(SUBSTRING(codigo FROM 5) AS INT) DESC LIMIT 1`,
    );
    let next = 'PRD-001';
    if (rows[0]) {
      const num = parseInt(rows[0].codigo.replace('PRD-', '')) + 1;
      next = `PRD-${String(num).padStart(3, '0')}`;
    }
    res.json({ success: true, codigo: next });
  } catch (e) { fmtError(res, e, 'getSiguienteCodigo'); }
};
