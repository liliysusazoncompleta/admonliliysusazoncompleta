/**
 * @fileoverview Controlador de Proveedores — CRUD completo
 * @module server/controllers/proveedoresController
 * Tabla: "TblProveedores"
 */
import { query } from '../config/db.js';

const err500 = (res, e, ctx) => {
  console.error(`[${ctx}]`, e.message);
  res.status(500).json({ success: false, message: `Error interno: ${e.message}` });
};

const getUser = (req) => req.user?.correo || req.user?.id_usuario?.toString() || 'sistema';

// ── GET /api/proveedores ──────────────────────────────────────────
export const getProveedores = async (req, res) => {
  try {
    const { q, estado, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    const conds  = [];

    if (q) {
      params.push(`%${q}%`);
      conds.push(`(nombre ILIKE $${params.length} OR nit ILIKE $${params.length})`);
    }
    if (estado) {
      params.push(estado);
      conds.push(`estado = $${params.length}`);
    }

    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    params.push(parseInt(limit), offset);

    const { rows } = await query(
      `SELECT * FROM "TblProveedores"
       ${where}
       ORDER BY nombre ASC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );

    const { rows: [{ count }] } = await query(
      `SELECT COUNT(*) FROM "TblProveedores" ${where}`,
      params.slice(0, -2),
    );

    res.json({ success: true, data: rows, total: parseInt(count) });
  } catch (e) { err500(res, e, 'getProveedores'); }
};

// ── GET /api/proveedores/:id ──────────────────────────────────────
export const getProveedorById = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT * FROM "TblProveedores" WHERE id = $1`,
      [req.params.id],
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Proveedor no encontrado.' });
    res.json({ success: true, data: rows[0] });
  } catch (e) { err500(res, e, 'getProveedorById'); }
};

// ── POST /api/proveedores ─────────────────────────────────────────
export const createProveedor = async (req, res) => {
  try {
    const { nit, nombre, direccion, telefono, estado = 'Activo' } = req.body;

    if (!nit?.trim() || !nombre?.trim())
      return res.status(400).json({ success: false, message: 'NIT y nombre son requeridos.' });

    // Verificar NIT único
    const { rows: dup } = await query(
      `SELECT id FROM "TblProveedores" WHERE nit = $1`,
      [nit.trim()],
    );
    if (dup[0])
      return res.status(409).json({ success: false, message: `Ya existe un proveedor con el NIT ${nit}.` });

    const usuario = getUser(req);
    const { rows } = await query(
      `INSERT INTO "TblProveedores"
         (nit, nombre, direccion, telefono, estado, created_by, updated_by)
       VALUES ($1,$2,$3,$4,$5,$6,$6)
       RETURNING *`,
      [nit.trim(), nombre.trim(), direccion?.trim() || null,
       telefono?.trim() || null, estado, usuario],
    );

    console.log(`[createProveedor] ✅ ${rows[0].nit} — ${rows[0].nombre}`);
    res.status(201).json({ success: true, message: 'Proveedor creado correctamente.', data: rows[0] });
  } catch (e) { err500(res, e, 'createProveedor'); }
};

// ── PUT /api/proveedores/:id ──────────────────────────────────────
export const updateProveedor = async (req, res) => {
  try {
    const { nit, nombre, direccion, telefono, estado } = req.body;
    const { id } = req.params;

    if (!nit?.trim() || !nombre?.trim())
      return res.status(400).json({ success: false, message: 'NIT y nombre son requeridos.' });

    // Verificar NIT único (excluir el actual)
    const { rows: dup } = await query(
      `SELECT id FROM "TblProveedores" WHERE nit = $1 AND id <> $2`,
      [nit.trim(), id],
    );
    if (dup[0])
      return res.status(409).json({ success: false, message: `Ya existe otro proveedor con el NIT ${nit}.` });

    const usuario = getUser(req);
    const { rows } = await query(
      `UPDATE "TblProveedores"
       SET nit=$1, nombre=$2, direccion=$3, telefono=$4, estado=$5,
           updated_at=NOW(), updated_by=$6
       WHERE id=$7
       RETURNING *`,
      [nit.trim(), nombre.trim(), direccion?.trim() || null,
       telefono?.trim() || null, estado || 'Activo', usuario, id],
    );

    if (!rows[0]) return res.status(404).json({ success: false, message: 'Proveedor no encontrado.' });
    res.json({ success: true, message: 'Proveedor actualizado correctamente.', data: rows[0] });
  } catch (e) { err500(res, e, 'updateProveedor'); }
};

// ── PATCH /api/proveedores/:id/estado ─────────────────────────────
export const toggleEstado = async (req, res) => {
  try {
    const { rows: [actual] } = await query(
      `SELECT estado FROM "TblProveedores" WHERE id = $1`,
      [req.params.id],
    );
    if (!actual) return res.status(404).json({ success: false, message: 'Proveedor no encontrado.' });

    const nuevoEstado = actual.estado === 'Activo' ? 'Inactivo' : 'Activo';
    const { rows } = await query(
      `UPDATE "TblProveedores"
       SET estado=$1, updated_at=NOW(), updated_by=$2
       WHERE id=$3 RETURNING id, nombre, estado`,
      [nuevoEstado, getUser(req), req.params.id],
    );
    res.json({ success: true, message: `Proveedor ${nuevoEstado.toLowerCase()}.`, data: rows[0] });
  } catch (e) { err500(res, e, 'toggleEstado'); }
};

// ── DELETE /api/proveedores/:id ───────────────────────────────────
export const deleteProveedor = async (req, res) => {
  try {
    const { rows } = await query(
      `DELETE FROM "TblProveedores" WHERE id=$1 RETURNING id, nombre`,
      [req.params.id],
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Proveedor no encontrado.' });
    res.json({ success: true, message: `Proveedor "${rows[0].nombre}" eliminado correctamente.` });
  } catch (e) { err500(res, e, 'deleteProveedor'); }
};